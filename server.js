const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const { router: ratingRoutes } = require('./routes/ratingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching FRONTEND_URL
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', ratingRoutes); // Mount rating routes for /:id/rate etc.
app.use('/api/recipes', recipeRoutes); // Mount recipe CRUD routes

// Aliases for convenience if called without /api prefix
app.use('/auth', authRoutes);
app.use('/recipes', ratingRoutes);
app.use('/recipes', recipeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Recipe Haven backend is running smoothly!',
    timestamp: new Date().toISOString(),
  });
});

// Root welcome message
app.get('/', (req, res) => {
  res.send('Recipe Haven API is online! Visit /api/health for system status.');
});

// Global 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server`,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  // Handle Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for parameter: ${err.path}`,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB & start server
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recipe_haven';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(' Successfully connected to MongoDB Database');
    app.listen(PORT, () => {
      console.log(` Recipe Haven Server running on http://localhost:${PORT}`);
      console.log(` Static uploads served at http://localhost:${PORT}/uploads/`);
    });
  })
  .catch((error) => {
    console.error(' MongoDB connection failed:', error.message);
    process.exit(1);
  });
