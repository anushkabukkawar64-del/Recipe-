import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, ChefHat, ArrowRight, Utensils, Coffee } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { recipeService, getImageUrl } from '../services/api';

const CATEGORIES = ['All', 'Breakfast', 'Dinner', 'Drinks', 'Dessert'];

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState(null);

  // Fetch recipes with optional search and category filters
  const fetchRecipes = async (search = '', category = 'All') => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;

      const data = await recipeService.getAllRecipes(params);
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Unable to load recipes right now. Please make sure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(searchTerm, selectedCategory);
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecipes(searchTerm, selectedCategory);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <Sparkles size={16} /> Welcome to Recipe Haven
              </div>
              <h1 className="hero-title">
                Discover Your Next <span>Favorite Recipe</span>
              </h1>
              <p className="hero-subtitle">
                Explore hundreds of wholesome, tested, and aesthetically crafted
                dishes shared by a loving community of home chefs and foodies.
              </p>

              {/* Search Bar Form */}
              <form onSubmit={handleSearchSubmit} className="hero-search-wrapper">
                <input
                  type="text"
                  placeholder="Search recipes, ingredients, or comfort food..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="hero-search-input"
                />
                <button
                  type="submit"
                  className="hero-search-btn"
                  title="Search recipes"
                  aria-label="Search recipes"
                >
                  <Search size={20} />
                </button>
              </form>

              {/* Quick Suggestion Chips */}
              <div className="hero-tags">
                <span>Popular:</span>
                <button
                  type="button"
                  className="hero-tag-chip"
                  onClick={() => {
                    setSearchTerm('Pancakes');
                    fetchRecipes('Pancakes', selectedCategory);
                  }}
                >
                  Pancakes
                </button>
                <button
                  type="button"
                  className="hero-tag-chip"
                  onClick={() => {
                    setSearchTerm('Pasta');
                    fetchRecipes('Pasta', selectedCategory);
                  }}
                >
                  Pasta
                </button>
                <button
                  type="button"
                  className="hero-tag-chip"
                  onClick={() => {
                    setSearchTerm('Matcha');
                    fetchRecipes('Matcha', selectedCategory);
                  }}
                >
                  Matcha
                </button>
                <button
                  type="button"
                  className="hero-tag-chip"
                  onClick={() => {
                    setSearchTerm('Avocado');
                    fetchRecipes('Avocado', selectedCategory);
                  }}
                >
                  Avocado
                </button>
              </div>
            </div>

            {/* Hero Image & Floating Stat Card */}
            <div className="hero-image-card">
              <div className="hero-main-img-wrapper">
                <img
                  src={getImageUrl('/uploads/berry_pancakes.jpg')}
                  alt="Delicious fluffy berry pancakes"
                />
              </div>
              <div className="floating-stats-card">
                <div className="floating-icon">
                  <ChefHat size={22} />
                </div>
                <div className="floating-text">
                  <h4>Community Kitchen</h4>
                  <p>100% Tested & Wholesome</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Recipe Explorer Section */}
      <section id="explore-recipes" className="recipes-section">
        <div className="container">
          {/* Section Header with Category Filter */}
          <div className="section-header">
            <div>
              <h2 className="section-title">Explore Recipes</h2>
              <p className="section-subtitle">
                {selectedCategory === 'All'
                  ? 'All delicious recipes from our community chefs'
                  : `Showing ${selectedCategory} recipes`}
              </p>
            </div>

            {/* Category Pills */}
            <div className="category-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Error Notice */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Loading Spinner */}
          {loading ? (
            <div className="loading-spinner-wrapper">
              <div className="spinner"></div>
              <p style={{ color: 'var(--text-medium)', fontWeight: 500 }}>
                Whisking up delicious recipes...
              </p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Utensils size={32} />
              </div>
              <h3>No Recipes Found</h3>
              <p>
                We couldn't find any recipes matching your search. Be the first to share one!
              </p>
              <Link to="/add-recipe" className="btn btn-primary">
                Add a Recipe Now
              </Link>
            </div>
          ) : (
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
