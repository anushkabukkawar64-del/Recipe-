import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  Users,
  ChefHat,
  Calendar,
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { recipeService, ratingService, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Checklist state for ingredients
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Interactive rating state
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingMessage, setRatingMessage] = useState({ text: '', type: '' });

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch recipe data
  const loadRecipe = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await recipeService.getRecipeById(id);
      setRecipe(data.recipe);
      if (data.recipe.userRating) {
        setSelectedRating(data.recipe.userRating);
      }
    } catch (err) {
      console.error('Error fetching recipe:', err);
      setError('Recipe could not be found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipe();
  }, [id]);

  // Toggle ingredient checkbox
  const toggleIngredient = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Submit star rating
  const handleRatingSubmit = async (stars) => {
    if (!isAuthenticated) {
      setRatingMessage({
        text: 'Please log in or register to rate this recipe!',
        type: 'error',
      });
      return;
    }

    if (recipe?.userHasRated) {
      setRatingMessage({
        text: 'You have already submitted a rating for this recipe.',
        type: 'error',
      });
      return;
    }

    try {
      setRatingSubmitting(true);
      setSelectedRating(stars);
      const res = await ratingService.rateRecipe(id, stars);

      setRatingMessage({
        text: res.message || 'Thank you for your rating!',
        type: 'success',
      });

      // Update recipe rating statistics dynamically
      setRecipe((prev) => ({
        ...prev,
        averageRating: res.stats.averageRating,
        totalRatings: res.stats.totalRatings,
        userHasRated: true,
        userRating: stars,
      }));
    } catch (err) {
      setRatingMessage({
        text:
          err.response?.data?.message ||
          'Failed to record your rating. Please try again.',
        type: 'error',
      });
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Handle recipe deletion
  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await recipeService.deleteRecipe(id);
      navigate('/my-recipes');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete recipe');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p style={{ color: 'var(--text-medium)', fontWeight: 500 }}>
          Fetching secret ingredients & cooking notes...
        </p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <div className="empty-state">
          <AlertCircle size={40} color="var(--danger-text)" style={{ margin: '0 auto 16px' }} />
          <h3>Recipe Not Found</h3>
          <p>{error || 'This recipe might have been moved or removed.'}</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if current user is owner
  const isOwner =
    user && recipe.user && (recipe.user._id === user._id || recipe.user === user._id);

  const formattedDate = recipe.createdAt
    ? new Date(recipe.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="recipe-details-page">
      <div className="container">
        {/* Navigation back */}
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Recipes
        </Link>

        {/* Recipe Header */}
        <div className="recipe-header">
          <div className="recipe-header-top">
            <h1 className="recipe-details-title">{recipe.title}</h1>

            {/* Owner Actions */}
            {isOwner && (
              <div className="owner-actions">
                <Link to={`/recipes/edit/${recipe._id}`} className="btn btn-outline btn-sm">
                  <Edit3 size={15} /> Edit Recipe
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={15} /> Delete Recipe
                </button>
              </div>
            )}
          </div>

          <p className="recipe-details-desc">{recipe.description}</p>

          {/* Metadata bar */}
          <div className="recipe-meta-bar">
            <div className="meta-item">
              <div className="creator-avatar">
                <ChefHat size={14} />
              </div>
              <span>
                By <strong>{recipe.user?.name || 'Chef'}</strong>
              </span>
            </div>

            {recipe.prepTime && (
              <div className="meta-item">
                <Clock size={16} color="var(--peach-primary)" />
                <span>
                  Time: <strong>{recipe.prepTime}</strong>
                </span>
              </div>
            )}

            {recipe.servings && (
              <div className="meta-item">
                <Users size={16} color="var(--sage-dark)" />
                <span>
                  Yield: <strong>{recipe.servings}</strong>
                </span>
              </div>
            )}

            {recipe.category && (
              <div className="meta-item">
                <span className="card-category-badge" style={{ position: 'static' }}>
                  {recipe.category}
                </span>
              </div>
            )}

            <div className="meta-item">
              <Star size={16} fill="var(--star-yellow)" color="var(--star-yellow)" />
              <span>
                Rating: <strong>{Number(recipe.averageRating).toFixed(1)}</strong> ({recipe.totalRatings || 0} reviews)
              </span>
            </div>

            {formattedDate && (
              <div className="meta-item" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                <Calendar size={15} />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero Image */}
        <div className="details-hero-img-box">
          <img
            src={getImageUrl(recipe.imagePath)}
            alt={recipe.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80';
            }}
          />
        </div>

        {/* Details Grid: Left: Ingredients | Right: Steps & Rating */}
        <div className="details-grid">
          {/* Ingredients Column */}
          <aside className="ingredients-card">
            <h3 className="card-section-title">
              <Sparkles size={20} color="var(--peach-primary)" /> Ingredients
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Tap items to check them off as you prepare:
            </p>
            <ul className="ingredients-list">
              {recipe.ingredients &&
                recipe.ingredients.map((ingredient, idx) => (
                  <li
                    key={idx}
                    className={`ingredient-item ${checkedIngredients[idx] ? 'checked' : ''}`}
                    onClick={() => toggleIngredient(idx)}
                  >
                    <input
                      type="checkbox"
                      className="ingredient-checkbox"
                      checked={Boolean(checkedIngredients[idx])}
                      onChange={() => {}}
                    />
                    <span>{ingredient}</span>
                  </li>
                ))}
            </ul>
          </aside>

          {/* Steps & Interactive Rating Column */}
          <div className="instructions-column">
            <h3 className="card-section-title">Instructions & Method</h3>
            <div className="steps-container">
              {recipe.steps &&
                recipe.steps.map((step, idx) => (
                  <div key={idx} className="step-card">
                    <div className="step-number">{idx + 1}</div>
                    <div className="step-text">{step}</div>
                  </div>
                ))}
            </div>

            {/* Interactive Rating Section */}
            <div className="rating-interactive-box">
              <div className="rating-badge-summary">
                <Star size={18} fill="var(--star-yellow)" color="var(--star-yellow)" />
                <span>
                  {Number(recipe.averageRating).toFixed(1)} / 5.0 (Based on {recipe.totalRatings} ratings)
                </span>
              </div>

              <h4 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>
                {recipe.userHasRated
                  ? `You rated this recipe ${recipe.userRating} stars!`
                  : 'How did your dish turn out?'}
              </h4>
              <p className="rating-prompt-text">
                {recipe.userHasRated
                  ? 'Thank you for your valuable feedback to the community.'
                  : 'Click on a star below to rate this recipe from 1 to 5 stars:'}
              </p>

              {/* 5-Star interactive buttons */}
              <div className="rating-stars-interactive">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled =
                    (hoverRating || selectedRating || recipe.userRating || 0) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      className="star-interactive-btn"
                      disabled={recipe.userHasRated || ratingSubmitting}
                      onMouseEnter={() => !recipe.userHasRated && setHoverRating(star)}
                      onMouseLeave={() => !recipe.userHasRated && setHoverRating(0)}
                      onClick={() => handleRatingSubmit(star)}
                      title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`star-svg ${isFilled ? 'filled' : 'empty'}`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Rating message feedback */}
              {ratingMessage.text && (
                <div
                  className={`alert ${
                    ratingMessage.type === 'error' ? 'alert-error' : 'alert-success'
                  }`}
                  style={{ maxWidth: '400px', margin: '16px auto 0' }}
                >
                  {ratingMessage.type === 'error' ? (
                    <AlertCircle size={18} />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  <span>{ratingMessage.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px',
            }}
          >
            <div
              style={{
                background: 'white',
                padding: '32px',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '440px',
                width: '100%',
                boxShadow: 'var(--shadow-lg)',
                textAlign: 'center',
              }}
            >
              <Trash2 size={40} color="var(--danger-text)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Delete Recipe?</h3>
              <p style={{ color: 'var(--text-medium)', marginBottom: '24px' }}>
                Are you sure you want to delete "<strong>{recipe.title}</strong>"? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="btn btn-danger"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetails;
