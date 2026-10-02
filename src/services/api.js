import axios from 'axios';

// Base API URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:5005';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or invalid, we can optionally clear token
    if (error.response && error.response.status === 401) {
      // Do not clear token automatically on simple rate failure or optionalAuth checks
    }
    return Promise.reject(error);
  }
);

// Helper function to resolve image URLs properly
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    // Cute SVG default placeholder
    return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  // Ensure image starts with slash
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${IMAGE_BASE_URL}${cleanPath}`;
};

// ----------------- Auth API -----------------
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },
};

// ----------------- Recipe API -----------------
export const recipeService = {
  // Get all recipes with optional search and category filters
  getAllRecipes: async (params = {}) => {
    const response = await api.get('/recipes', { params });
    return response.data;
  },

  // Get a single recipe by its ID
  getRecipeById: async (id) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  // Get recipes created by the current user
  getMyRecipes: async () => {
    const response = await api.get('/recipes/my-recipes');
    return response.data;
  },

  // Create a new recipe (FormData for file upload)
  createRecipe: async (formData) => {
    const response = await api.post('/recipes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update existing recipe (FormData for file upload)
  updateRecipe: async (id, formData) => {
    const response = await api.put(`/recipes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a recipe
  deleteRecipe: async (id) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },
};

// ----------------- Rating API -----------------
export const ratingService = {
  // Submit a rating (1 to 5)
  rateRecipe: async (recipeId, value) => {
    const response = await api.post(`/recipes/${recipeId}/rate`, { value });
    return response.data;
  },

  // Get dynamically aggregated average rating
  getAverageRating: async (recipeId) => {
    const response = await api.get(`/recipes/${recipeId}/average-rating`);
    return response.data;
  },

  // Get all ratings and check if user has rated
  getRecipeRatings: async (recipeId) => {
    const response = await api.get(`/recipes/${recipeId}/ratings`);
    return response.data;
  },
};

export default api;
