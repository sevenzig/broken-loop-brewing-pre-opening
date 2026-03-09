import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styles from './AdminBeerEditPage.module.css';

interface EventFormData {
  name: string;
  slug: string;
  image: string;
  date: string;
  time: string;
  status: string;
  category: string;
  brief_description: string;
  price: string;
  capacity: string;
  location: string;
  featured: boolean;
  recurring: string;
  organizer: string;
  artist: string;
  genre: string;
  registration_required: boolean;
  contact_info: string;
  content: string;
}

const EVENT_CATEGORIES = [
  'Live Music',
  'Trivia',
  'Tasting',
  'Community',
  'Sports',
  'Seasonal',
  'Special',
];

const EVENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

export const AdminEventEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();

  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    slug: '',
    image: '',
    date: '',
    time: '',
    status: 'upcoming',
    category: 'Community',
    brief_description: '',
    price: '',
    capacity: '',
    location: '',
    featured: false,
    recurring: '',
    organizer: '',
    artist: '',
    genre: '',
    registration_required: false,
    contact_info: '',
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
    const loadEventData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/events/${uuid}`, { headers: getAuthHeaders() });

        if (!response.ok) {
          setError(response.status === 404 ? 'Event not found' : 'Failed to load event');
          setLoading(false);
          return;
        }

        const result = await response.json();
        const ev = result.data ?? result;

        setFormData({
          name: ev.name || '',
          slug: ev.slug || '',
          image: ev.image || '',
          date: ev.date || '',
          time: ev.time || '',
          status: ev.status || 'upcoming',
          category: ev.category || 'Community',
          brief_description: ev.brief_description || '',
          price: ev.price || '',
          capacity: ev.capacity || '',
          location: ev.location || '',
          featured: ev.featured ?? false,
          recurring: ev.recurring || '',
          organizer: ev.organizer || '',
          artist: ev.artist || '',
          genre: ev.genre || '',
          registration_required: ev.registration_required ?? false,
          contact_info: ev.contact_info || '',
          content: ev.markdown || ev.content || '',
        });
      } catch (err) {
        setError('Failed to load event');
        console.error('Error loading event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      loadEventData();
    }
  }, [uuid]);

  const handleChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/events/${uuid}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          markdown: formData.content,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save event');
      }

      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading event data...</div>
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
        <h1>Edit Event</h1>
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
              <label htmlFor="name">Event Name</label>
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
                {EVENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={e => handleChange('status', e.target.value)}
              >
                {EVENT_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
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
          <h2>Schedule</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => handleChange('date', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="time">Time</label>
              <input
                id="time"
                type="text"
                value={formData.time}
                onChange={e => handleChange('time', e.target.value)}
                placeholder="7:00 PM - 10:00 PM"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="recurring">Recurring</label>
              <input
                id="recurring"
                type="text"
                value={formData.recurring}
                onChange={e => handleChange('recurring', e.target.value)}
                placeholder="Weekly, Monthly, etc."
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Details</h2>
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
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="text"
                value={formData.price}
                onChange={e => handleChange('price', e.target.value)}
                placeholder="Free / $10 / etc."
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="capacity">Capacity</label>
              <input
                id="capacity"
                type="text"
                value={formData.capacity}
                onChange={e => handleChange('capacity', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="organizer">Organizer</label>
              <input
                id="organizer"
                type="text"
                value={formData.organizer}
                onChange={e => handleChange('organizer', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="artist">Artist / Performer</label>
              <input
                id="artist"
                type="text"
                value={formData.artist}
                onChange={e => handleChange('artist', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="genre">Genre</label>
              <input
                id="genre"
                type="text"
                value={formData.genre}
                onChange={e => handleChange('genre', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="contact_info">Contact Info</label>
              <input
                id="contact_info"
                type="text"
                value={formData.contact_info}
                onChange={e => handleChange('contact_info', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.toggleGroup}>
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
                  checked={formData.registration_required}
                  onChange={e => handleChange('registration_required', e.target.checked)}
                />
                Registration Required
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

export default AdminEventEditPage;
