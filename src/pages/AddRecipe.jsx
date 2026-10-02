import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { recipeService, getImageUrl } from '../services/api';

const AddRecipe = () => {
  const { id } = useParams(); // If id exists, it's Edit mode!
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [prepTime, setPrepTime] = useState('25 mins');
  const [servings, setServings] = useState('2-4 servings');

  // Dynamic lists
  const [ingredients, setIngredients] = useState(['', '', '']);
  const [steps, setSteps] = useState(['', '']);

  // Image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImagePath, setExistingImagePath] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [fetchingRecipe, setFetchingRecipe] = useState(isEditMode);
  const [error, setError] = useState('');

  // If edit mode, fetch recipe details
  useEffect(() => {
    if (isEditMode) {
      const loadRecipeToEdit = async () => {
        try {
          setFetchingRecipe(true);
          const data = await recipeService.getRecipeById(id);
          const r = data.recipe;
          setTitle(r.title || '');
          setDescription(r.description || '');
          setCategory(r.category || 'Breakfast');
          setPrepTime(r.prepTime || '25 mins');
          setServings(r.servings || '2-4 servings');
          setIngredients(r.ingredients && r.ingredients.length > 0 ? r.ingredients : ['']);
          setSteps(r.steps && r.steps.length > 0 ? r.steps : ['']);
          if (r.imagePath) {
            setExistingImagePath(r.imagePath);
            setImagePreview(getImageUrl(r.imagePath));
          }
        } catch (err) {
          setError('Failed to load recipe details for editing.');
        } finally {
          setFetchingRecipe(false);
        }
      };
      loadRecipeToEdit();
    }
  }, [id, isEditMode]);

  // Ingredients handlers
  const handleIngredientChange = (index, value) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredientField = (index) => {
    if (ingredients.length <= 1) {
      setIngredients(['']);
      return;
    }
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Steps handlers
  const handleStepChange = (index, value) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const addStepField = () => {
    setSteps([...steps, '']);
  };

  const removeStepField = (index) => {
    if (steps.length <= 1) {
      setSteps(['']);
      return;
    }
    setSteps(steps.filter((_, i) => i !== index));
  };

  // Image upload handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImagePath('');
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Clean dynamic inputs
    const validIngredients = ingredients.map((i) => i.trim()).filter((i) => i.length > 0);
    const validSteps = steps.map((s) => s.trim()).filter((s) => s.length > 0);

    if (!title.trim() || !description.trim()) {
      setError('Please provide both a recipe title and description.');
      return;
    }

    if (validIngredients.length === 0) {
      setError('Please provide at least one ingredient.');
      return;
    }

    if (validSteps.length === 0) {
      setError('Please provide at least one cooking instruction step.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('prepTime', prepTime.trim());
      formData.append('servings', servings.trim());
      formData.append('ingredients', JSON.stringify(validIngredients));
      formData.append('steps', JSON.stringify(validSteps));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (existingImagePath) {
        formData.append('imageUrl', existingImagePath);
      }

      let res;
      if (isEditMode) {
        res = await recipeService.updateRecipe(id, formData);
        navigate(`/recipes/${id}`);
      } else {
        res = await recipeService.createRecipe(formData);
        navigate(`/recipes/${res.recipe._id}`);
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      setError(
        err.response?.data?.message || 'Failed to save recipe. Please check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingRecipe) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p>Loading recipe details...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 20px 80px' }}>
      <Link to={isEditMode ? `/recipes/${id}` : '/'} className="back-link">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="form-page-container">
        <div className="form-header">
          <div
            className="brand-icon-box"
            style={{ margin: '0 auto 16px', width: '50px', height: '50px' }}
          >
            <Sparkles size={24} />
          </div>
          <h1>{isEditMode ? 'Edit Your Recipe' : 'Create a New Recipe'}</h1>
          <p>
            {isEditMode
              ? 'Update the details, ingredients, or cooking steps for your recipe'
              : 'Share your favorite homemade dish with the Recipe Haven community'}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="recipe-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="recipe-title">
              Recipe Title *
            </label>
            <input
              id="recipe-title"
              type="text"
              required
              placeholder="e.g. Grandma's Fluffy Buttermilk Biscuits"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="recipe-desc">
              Short Description / Story *
            </label>
            <textarea
              id="recipe-desc"
              rows={3}
              required
              placeholder="Describe the flavors, texture, or story behind this delicious dish..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Category, Prep Time, Servings */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="recipe-category">
                Category
              </label>
              <select
                id="recipe-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Drinks">Drinks</option>
                <option value="Dessert">Dessert</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="recipe-preptime">
                Cooking Time
              </label>
              <input
                id="recipe-preptime"
                type="text"
                placeholder="e.g. 30 mins"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="recipe-servings">
                Servings
              </label>
              <input
                id="recipe-servings"
                type="text"
                placeholder="e.g. 4 servings"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Image Upload with Preview */}
          <div className="form-group">
            <label className="form-label">Recipe Photo</label>
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Recipe preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="remove-img-btn"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="image-upload-wrapper">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageChange}
                  className="image-upload-hidden"
                />
                <div className="image-upload-prompt">
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                    }}
                  >
                    <Upload size={22} color="var(--peach-primary)" />
                  </div>
                  <strong>Click or Drag to Upload Recipe Photo</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-medium)' }}>
                    Supports PNG, JPG, WEBP (Up to 5MB)
                  </span>
                </div>
              </label>
            )}
          </div>

          {/* Dynamic Ingredients Section */}
          <div className="form-group">
            <label className="form-label">
              <span>Ingredients List *</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Add measurements and items
              </span>
            </label>
            <div className="dynamic-list-wrapper">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="dynamic-item-row">
                  <input
                    type="text"
                    placeholder={`e.g. ${
                      idx === 0
                        ? '2 cups all-purpose flour'
                        : idx === 1
                        ? '1 cup fresh whole milk'
                        : '1 tsp pure vanilla extract'
                    }`}
                    value={ing}
                    onChange={(e) => handleIngredientChange(idx, e.target.value)}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredientField(idx)}
                    className="dynamic-remove-btn"
                    title="Remove ingredient"
                    aria-label="Remove ingredient"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addIngredientField}
                className="add-dynamic-item-btn"
              >
                <Plus size={16} /> Add Another Ingredient
              </button>
            </div>
          </div>

          {/* Dynamic Cooking Instructions Steps */}
          <div className="form-group">
            <label className="form-label">
              <span>Cooking Steps *</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Number each clear step
              </span>
            </label>
            <div className="dynamic-list-wrapper">
              {steps.map((st, idx) => (
                <div key={idx} className="dynamic-item-row" style={{ alignItems: 'flex-start' }}>
                  <div
                    className="step-number"
                    style={{ width: '32px', height: '32px', fontSize: '0.9rem', marginTop: '6px' }}
                  >
                    {idx + 1}
                  </div>
                  <textarea
                    rows={2}
                    placeholder={`Step ${idx + 1}: Explain what to do in detail...`}
                    value={st}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    className="form-textarea"
                  />
                  <button
                    type="button"
                    onClick={() => removeStepField(idx)}
                    className="dynamic-remove-btn"
                    style={{ marginTop: '6px' }}
                    title="Remove step"
                    aria-label="Remove step"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addStepField}
                className="add-dynamic-item-btn"
              >
                <Plus size={16} /> Add Next Step
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? (
              'Publishing your recipe...'
            ) : (
              <>
                <CheckCircle size={20} />
                {isEditMode ? 'Save Recipe Changes' : 'Publish Recipe'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;
