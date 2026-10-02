import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, ChefHat, Edit3, Trash2 } from 'lucide-react';
import { getImageUrl } from '../services/api';

const RecipeCard = ({ recipe, isOwner = false, onDelete }) => {
  const {
    _id,
    title,
    description,
    imagePath,
    category,
    prepTime,
    averageRating = 0,
    totalRatings = 0,
    user,
  } = recipe;

  // Format star rating
  const formattedRating = Number(averageRating) > 0 ? Number(averageRating).toFixed(1) : 'New';

  return (
    <article className="recipe-card">
      <Link to={`/recipes/${_id}`} className="card-image-box">
        <img
          src={getImageUrl(imagePath)}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {category && <span className="card-category-badge">{category}</span>}
        <div className="card-rating-badge" title={`${totalRatings} ratings`}>
          <Star size={14} className="star-icon" />
          <span>{formattedRating}</span>
          {totalRatings > 0 && (
            <span style={{ fontSize: '0.74rem', color: '#888', fontWeight: 'normal' }}>
              ({totalRatings})
            </span>
          )}
        </div>
      </Link>

      <div className="card-content">
        <Link to={`/recipes/${_id}`}>
          <h3 className="card-title" title={title}>
            {title}
          </h3>
        </Link>
        <p className="card-description">{description}</p>

        <div className="card-meta">
          <div className="creator-info">
            <div className="creator-avatar">
              <ChefHat size={14} />
            </div>
            <span>{user?.name || 'Community Chef'}</span>
          </div>

          {prepTime && (
            <div className="recipe-time">
              <Clock size={14} />
              <span>{prepTime}</span>
            </div>
          )}
        </div>

        {/* Optional Owner Actions (My Recipes) */}
        {isOwner && (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px dashed var(--cream-border)',
            }}
          >
            <Link
              to={`/recipes/edit/${_id}`}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, padding: '6px 12px' }}
            >
              <Edit3 size={14} /> Edit
            </Link>
            <button
              onClick={() => onDelete && onDelete(_id)}
              className="btn btn-danger btn-sm"
              style={{ flex: 1, padding: '6px 12px' }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default RecipeCard;
