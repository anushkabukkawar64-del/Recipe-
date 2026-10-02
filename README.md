# 🍳 Recipe Haven — Full-Stack Recipe Sharing Platform

> A cute, aesthetic, modern recipe sharing platform built with **React.js, Node.js, Express.js, MongoDB, and Mongoose**. Features a warm pastel aesthetic (cream, peach, soft pink, sage green, and white), dynamic rating calculation using MongoDB aggregation, secure JWT authentication, and image uploads via Multer.

---

## ✨ Features

- **🌸 Warm Pastel Aesthetic UI**: Carefully crafted design palette with creamy backgrounds, peach buttons, soft pink accents, and sage green badges with smooth micro-interactions.
- **🔐 User Authentication**: Secure registration and login using **bcrypt** password hashing and **JWT** (JSON Web Tokens). Includes protected routes and active session persistence.
- **🥘 Recipe CRUD Operations**:
  - Browse recipes with title search and category filters (Breakfast, Dinner, Drinks, Dessert, etc.).
  - Add new recipes with title, description, prep time, servings, dynamic ingredients list, numbered steps, and photo upload.
  - Edit and delete recipes (strictly protected by ownership middleware).
- **⭐ Dynamic 5-Star Rating System**:
  - Interactive 1–5 star rating widget.
  - Average ratings calculated **dynamically using MongoDB Aggregation Pipeline** from the `Rating` collection (never stale).
  - Built-in duplicate rating prevention using compound database indexes and runtime validation.
- **📋 Interactive Cooking Checklist**: Check off ingredients as you prepare the dish.
- **👤 Personal Recipe Box ("My Recipes")**: Filter and manage recipes published by the logged-in user.
- **📱 Fully Responsive**: Fluid layouts for mobile phones, tablets, and desktops.

---

## 📁 Project Structure

```
recipe-sharing-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Aesthetic navigation with mobile drawer & auth state
│   │   │   ├── RecipeCard.jsx      # Recipe card with rating badge, creator info, & image
│   │   │   └── Footer.jsx          # Warm branded footer
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Hero banner, search bar, category chips, recipe grid
│   │   │   ├── Login.jsx           # Clean auth form with demo chef autofill
│   │   │   ├── Register.jsx        # Validation, password matching, and registration
│   │   │   ├── AddRecipe.jsx       # Dual-mode Add/Edit form with dynamic lists & image preview
│   │   │   ├── RecipeDetails.jsx   # Hero photo, cooking checklist, instructions, & star rating
│   │   │   └── MyRecipes.jsx       # User's personal published recipes with edit & delete
│   │   ├── services/
│   │   │   └── api.js              # Axios instance, Bearer token interceptor, & API helpers
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Reactive user & token state provider
│   │   ├── App.jsx                 # Routing configuration & ProtectedRoute guard
│   │   ├── main.jsx                # React root mount
│   │   └── style.css               # Vanilla CSS design system & responsive styling
│   ├── .env                        # Frontend environment variables
│   ├── .env.example                # Example environment template
│   ├── index.html                  # HTML template with Google Fonts (Plus Jakarta & Quicksand)
│   ├── vite.config.js              # Vite configuration
│   └── package.json
│
├── backend/
│   ├── models/
│   │   ├── User.js                 # Name, email (unique), password, createdAt
│   │   ├── Recipe.js               # Title, description, ingredients, steps, imagePath, user
│   │   └── Rating.js               # Recipe ref, User ref, value (1-5), compound unique index
│   ├── routes/
│   │   ├── authRoutes.js           # /register, /login, /me
│   │   ├── recipeRoutes.js         # /recipes (GET, POST, PUT, DELETE, /my-recipes)
│   │   └── ratingRoutes.js         # /recipes/:id/rate, /average-rating, /ratings
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT Bearer token authentication
│   │   └── ownershipMiddleware.js  # Verifies author permissions for edit & delete
│   ├── uploads/                    # Uploaded recipe photos served statically
│   ├── seed.js                     # Database seeder with delicious demo recipes & users
│   ├── test_api.js                 # Automated API test suite
│   ├── .env                        # Backend environment variables
│   ├── .env.example                # Example backend environment template
│   ├── server.js                   # Express application entrypoint
│   └── package.json
│
├── recipe-haven-postman-collection.json   # Ready-to-import Postman Collection
├── recipe-haven-thunder-collection.json  # Ready-to-import Thunder Client Collection
└── README.md
```

---

## 🛠️ Required Software

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB Community Edition or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster

---

## ⚙️ Environment Configuration

### 1. Backend `.env` (`backend/.env`)

```env
PORT=5005
MONGODB_URI=mongodb://127.0.0.1:27017/recipe_haven
JWT_SECRET=recipe_haven_jwt_secret_key_2026_super_secure
FRONTEND_URL=http://localhost:5174
```

> **For MongoDB Atlas**: Replace `MONGODB_URI` with your connection string:
> `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/recipe_haven?retryWrites=true&w=majority`

### 2. Frontend `.env` (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5005/api
VITE_IMAGE_BASE_URL=http://localhost:5005
```

---

## 🚀 Installation & Running Locally

### Step 1: Clone or Navigate to the Workspace
```bash
cd recipe-sharing-platform
```

### Step 2: Set Up Backend
```bash
cd backend
npm install

# Seed the database with delicious demo recipes, photos & ratings
npm run seed

# Start backend server
npm start
```
*Backend will start on `http://localhost:5005`.*

### Step 3: Set Up Frontend
Open a new terminal window:
```bash
cd recipe-sharing-platform/frontend
npm install

# Start Vite development server
npm run dev
```
*Frontend will launch at `http://localhost:5174`.*

---

## 🧑‍🍳 Seed Demo Accounts

The database comes pre-seeded with home chefs for instant testing:

| Role | Email | Password |
|---|---|---|
| **Chef Chloe** | `chloe@recipehaven.com` | `password123` |
| **Oliver Vance** | `oliver@recipehaven.com` | `password123` |
| **Mia Sterling** | `mia@recipehaven.com` | `password123` |

*(You can also click the handy **"Use Demo Account"** button on the Login page).*

---

## 📡 REST API Reference

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Login user and retrieve JWT token |
| `GET` | `/api/auth/me` | Private | Get profile of logged-in user |

### Recipe Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/recipes` | Public | Get all recipes (supports `?search=` and `?category=`) |
| `GET` | `/api/recipes/:id` | Public | Get single recipe details with dynamic ratings |
| `GET` | `/api/recipes/my-recipes` | Private | Get recipes created by the authenticated user |
| `POST` | `/api/recipes` | Private | Create a recipe with image upload (`multipart/form-data`) |
| `PUT` | `/api/recipes/:id` | Private (Owner) | Edit existing recipe |
| `DELETE` | `/api/recipes/:id` | Private (Owner) | Delete recipe and associated ratings |

### Rating Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/recipes/:id/rate` | Private | Submit star rating (1 to 5). Prevents duplicate ratings |
| `GET` | `/api/recipes/:id/average-rating` | Public | Dynamic average rating and count via MongoDB aggregation |
| `GET` | `/api/recipes/:id/ratings` | Public | List all reviews and ratings for a recipe |

---

## 🧪 Testing with Postman or Thunder Client

1. **Import Collection**:
   - In **Postman**: Click **Import** &rarr; select [`recipe-haven-postman-collection.json`](./recipe-haven-postman-collection.json).
   - In **Thunder Client**: Click **Collections** &rarr; **Import** &rarr; select [`recipe-haven-thunder-collection.json`](./recipe-haven-thunder-collection.json).
2. **Environment Variable**: Set `baseUrl` to `http://localhost:5005/api`.
3. **Execute Requests**: Run Login, copy the returned `token` into headers as `Authorization: Bearer <token>`, and test creating recipes, rating, and managing personal recipes.

### Running the Automated API Verification Suite
```bash
cd recipe-sharing-platform/backend
node test_api.js
```
*Executes all 16 automated tests covering authentication, Multer uploads, dynamic ratings, duplicate rating prevention, and ownership middleware checks.*

---

## 🌐 Deployment Guide

### Deploying the Backend on [Render](https://render.com)

1. Create a new **Web Service** on Render connected to your repository.
2. Set the **Root Directory** to `backend`.
3. Set the **Build Command** to: `npm install`.
4. Set the **Start Command** to: `npm start`.
5. Add the following **Environment Variables**:
   - `PORT`: `10000` (or leave default Render port)
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/recipe_haven`
   - `JWT_SECRET`: A long random secret string
   - `FRONTEND_URL`: Your deployed frontend URL (e.g. `https://recipe-haven.vercel.app`)
6. Deploy the service and copy your public Render URL (e.g. `https://recipe-haven-api.onrender.com`).

### Deploying the Frontend on [Vercel](https://vercel.com)

1. Import your repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Set the following **Environment Variables**:
   - `VITE_API_URL`: `https://recipe-haven-api.onrender.com/api`
   - `VITE_IMAGE_BASE_URL`: `https://recipe-haven-api.onrender.com`
5. Click **Deploy**. Vercel will build and provide your production URL!

---

## 📜 License

MIT License. Crafted with ❤️ for passionate food lovers and home chefs.
