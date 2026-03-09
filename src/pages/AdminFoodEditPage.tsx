import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styles from './AdminBeerEditPage.module.css';

interface FoodFormData {
  name: string;
  slug: string;
  image: string;
  price: string;
  category: string;
  brief_description: string;
  ingredients: string;
  prep_time: string;
  spice_level: string;
  dietary_notes: string;
  available: boolean;
  featured: boolean;
  seasonal: boolean;
  content: string;
}

const FOOD_CATEGORIES = [
  'Appetizers',
  'Mains',
  'Sides',
  'Specials',
  'Desserts',
  'Kids',
];

export const AdminFoodEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();

  const [formData, setFormData] = useState<FoodFormData>({
    name: '',
    slug: '',
    image: '',
    price: '',
    category: 'Mains',
    brief_description: '',
    ingredients: '',
    prep_time: '',
    spice_level: '',
    dietary_notes: '',
    available: true,
    featured: false,
    seasonal: false,
    content: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('auth-token');
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    const loadFoodData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/food/${uuid}`, { headers: getAuthHeaders() });

        if (!response.ok) {
          setError(response.status === 404 ? 'Food item not found' : 'Failed to load food item');
          setLoading(false);
          return;
        }

        const result = await response.json();
        const item = result.data ?? result;

        setFormData({
          name: item.name || '',
          slug: item.slug || '',
          image: item.image || '',
          price: item.price || '',
          category: item.category || 'Mains',
          brief_description: item.brief_description || '',
          ingredients: item.ingredients || '',
          prep_time: item.prep_time || '',
          spice_level: item.spice_level || '',
          dietary_notes: item.dietary_notes || '',
          available: item.available ?? true,
          featured: item.featured ?? false,
          seasonal: item.seasonal ?? false,
          content: item.markdown || item.content || '',
        });
      } catch (err) {
        setError('Failed to load food item');
        console.error('Error loading food item:', err);
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      loadFoodData();
    }
  }, [uuid]);

  const handleChange = (field: keyof FoodFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/food/${uuid}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          markdown: formData.content,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save food item');
      }

      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save food item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading food item data...</div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/admin" className={styles.backButton}>Back to Admin</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Food Item</h1>
        <Link to="/admin" className={styles.backButton}>
          Back to Admin
        </Link>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h2>Basic Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={e => handleChange('slug', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={e => handleChange('category', e.target.value)}
              >
                {FOOD_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="text"
                value={formData.price}
                onChange={e => handleChange('price', e.target.value)}
                placeholder="$12.99"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="image">Image URL</label>
              <input
                id="image"
                type="text"
                value={formData.image}
                onChange={e => handleChange('image', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Description</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="brief_description">Brief Description</label>
              <textarea
                id="brief_description"
                value={formData.brief_description}
                onChange={e => handleChange('brief_description', e.target.value)}
                rows={3}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ingredients">Ingredients</label>
              <textarea
                id="ingredients"
                value={formData.ingredients}
                onChange={e => handleChange('ingredients', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Details</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="prep_time">Prep Time</label>
              <input
                id="prep_time"
                type="text"
                value={formData.prep_time}
                onChange={e => handleChange('prep_time', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="spice_level">Spice Level</label>
              <input
                id="spice_level"
                type="text"
                value={formData.spice_level}
                onChange={e => handleChange('spice_level', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="dietary_notes">Dietary Notes</label>
              <input
                id="dietary_notes"
                type="text"
                value={formData.dietary_notes}
                onChange={e => handleChange('dietary_notes', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.toggleGroup}>
            <div className={styles.toggleItem}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={e => handleChange('available', e.target.checked)}
                />
                Available
              </label>
            </div>
            <div className={styles.toggleItem}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={e => handleChange('featured', e.target.checked)}
                />
                Featured
              </label>
            </div>
            <div className={styles.toggleItem}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.seasonal}
                  onChange={e => handleChange('seasonal', e.target.checked)}
                />
                Seasonal
              </label>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Content</h2>
          <div className={styles.formGroup}>
            <label htmlFor="content">Full Description (Markdown)</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={e => handleChange('content', e.target.value)}
              rows={8}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/admin" className={styles.cancelButton}>Cancel</Link>
          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminFoodEditPage;
