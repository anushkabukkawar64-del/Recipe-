import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Utensils, AlertCircle, Sparkles } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { recipeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchUserRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await recipeService.getMyRecipes();
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error('Error fetching my recipes:', err);
      setError('Failed to load your recipes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRecipes();
  }, []);

  const handleDeleteRecipe = async (recipeId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete this recipe?'
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(recipeId);
      await recipeService.deleteRecipe(recipeId);
      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete recipe.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div className="section-header">
        <div>
          <div className="hero-badge">
            <Sparkles size={16} /> Personal Recipe Box
          </div>
          <h1 className="section-title">My Recipes</h1>
          <p className="section-subtitle">
            Manage, edit, and curate all the recipes you have shared with the Recipe Haven community.
          </p>
        </div>

        <Link to="/add-recipe" className="btn btn-primary">
          <PlusCircle size={18} /> Add New Recipe
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner-wrapper">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-medium)', fontWeight: 500 }}>
            Opening your personal recipe book...
          </p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Utensils size={32} />
          </div>
          <h3>You Haven't Shared Any Recipes Yet</h3>
          <p>
            Have a favorite family meal or creative bakery treat? Share it with other food lovers today!
          </p>
          <Link to="/add-recipe" className="btn btn-primary">
            Create Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              isOwner={true}
              onDelete={handleDeleteRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecipes;
