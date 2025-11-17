import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sortStyles } from '../utils/styleSorting';
import { AdminHeader } from '../components/AdminHeader/AdminHeader';
import styles from './AdminBeerEditPage.module.css';

interface BeerFormData {
  name: string;
  slug: string;
  image: string;
  availability: string;
  status: string;
  tapped_on: string;
  style: string;
  abv: string;
  ibu: string;
  srm: string;
  featured: boolean;
  barrel_aged: boolean;
  brief_description: string;
  aroma: string;
  flavor_profile: string;
  appearance: string;
  malts: string;
  hops: string;
  yeast: string;
  content: string;
  awards: string;
}

interface AdminMetadata {
  dropdowns: {
    statuses: Array<{ value: string; label: string; color: string }>;
    styles: Array<{ value: string; label: string; category: string }>;
    availability: Array<{ value: string; label: string }>;
  };
  stats: {
    totalBeers: number;
    onTap: number;
    seasonal: number;
    featured: number;
  };
}

export const AdminBeerEditPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<BeerFormData>({
    name: '',
    slug: '',
    image: '',
    availability: 'Year-round',
    status: 'on-tap',
    tapped_on: '',
    style: '',
    abv: '',
    ibu: '',
    srm: '',
    featured: false,
    barrel_aged: false,
    brief_description: '',
    aroma: '',
    flavor_profile: '',
    appearance: '',
    malts: '',
    hops: '',
    yeast: '',
    content: '',
    awards: ''
  });
  

  const [metadata, setMetadata] = useState<AdminMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadBeerData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load pre-processed beer data
      const beersResponse = await fetch('/data/beers.json');
      const beers = await beersResponse.json();
      
      // Find the specific beer by UUID
      const foundBeer = beers.find((beer: any) => beer.uuid === uuid);
      
      if (foundBeer) {
        setFormData({
          name: foundBeer.name || '',
          slug: foundBeer.slug || '',
          image: foundBeer.image || '',
          availability: foundBeer.availability || 'Year-round',
          status: foundBeer.status || 'on-tap',
          tapped_on: foundBeer.tapped_on || '',
          style: foundBeer.style || '',
          abv: foundBeer.abv || '',
          ibu: foundBeer.ibu || '',
          srm: foundBeer.srm || '',
          featured: foundBeer.featured || false,
          barrel_aged: foundBeer.barrel_aged || false,
          brief_description: foundBeer.brief_description || '',
          aroma: foundBeer.aroma || '',
          flavor_profile: foundBeer.flavor_profile || '',
          appearance: foundBeer.appearance || '',
          malts: foundBeer.malts || '',
          hops: foundBeer.hops || '',
          yeast: foundBeer.yeast || '',
          content: foundBeer.markdown || '', // Use original markdown for editing
          awards: foundBeer.awards || ''
        });
      } else {
        setError('Beer not found');
      }

      // Extract metadata from pre-processed beer data
      const stylesSet = new Set<string>();
      const statusesSet = new Set<string>();
      
      beers.forEach((beer: any) => {
        if (beer.style) stylesSet.add(beer.style);
        if (beer.status) statusesSet.add(beer.status);
      });

      // Load pre-processed beer styles data
      const stylesResponse = await fetch('/data/beer-styles.json');
      const beerStyles = await stylesResponse.json();
      
      // Transform beer styles for dropdown
      const styleGuideStyles: Array<{ value: string; label: string; category: string }> = [];
      beerStyles.forEach((style: any) => {
        if (style.style_name) {
          styleGuideStyles.push({
            value: style.style_name,
            label: `${style.style_code}. ${style.style_name}`,
            category: style.category_name || 'Other'
          });
        }
      });

      setMetadata({
        dropdowns: {
          statuses: Array.from(statusesSet).map(status => ({
            value: status,
            label: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
            color: status === 'on-tap' ? '#28a745' : status === 'coming-soon' ? '#ffc107' : '#6c757d'
          })),
          styles: styleGuideStyles.sort(sortStyles),
          availability: [
            { value: 'Year-round', label: 'Year-round' },
            { value: 'Seasonal', label: 'Seasonal' },
            { value: 'Limited', label: 'Limited Release' },
            { value: 'One-off', label: 'One-off' }
          ]
        },
        stats: {
          totalBeers: beers.length,
          onTap: beers.filter((beer: any) => beer.status === 'on-tap').length,
          seasonal: beers.filter((beer: any) => beer.availability === 'Seasonal').length,
          featured: beers.filter((beer: any) => beer.featured).length
        }
      });
    } catch (err) {
      setError('Failed to load beer data');
      console.error('Error loading beer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uuid) {
      loadBeerData();
    }
  }, [uuid]);

  const handleInputChange = (field: keyof BeerFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Generate markdown content
      const markdown = `---
name: '${formData.name}'
image: '${formData.image}'
slug: '${formData.slug}'
abv: '${formData.abv}'
ibu: '${formData.ibu}'
srm: '${formData.srm}'
style: '${formData.style}'
status: '${formData.status}'
availability: '${formData.availability}'
tapped_on: '${formData.tapped_on}'
featured: ${formData.featured}
barrel_aged: ${formData.barrel_aged}
brief_description: '${formData.brief_description}'
aroma: '${formData.aroma}'
flavor_profile: '${formData.flavor_profile}'
appearance: '${formData.appearance}'
malts: '${formData.malts}'
hops: '${formData.hops}'
yeast: '${formData.yeast}'
awards: '${formData.awards}'
---

${formData.content}`;

      // For now, just log the markdown (in production, this would save to file)
      console.log('Generated markdown:', markdown);
      
      // Navigate back to admin panel
      navigate('/admin');
    } catch (err) {
      setError('Failed to save beer');
      console.error('Error saving beer:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading beer data...</div>
      </div>
    );
  }

  if (error) {
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
      <AdminHeader />
      <div className={styles.header}>
        <h1>Edit Beer: {formData.name}</h1>
        <Link to="/admin" className={styles.backButton}>
          ← Back to Admin
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h2>Basic Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="slug">Slug *</label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="image">Image Path</label>
              <input
                type="text"
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="availability">Availability</label>
              <select
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
              >
                {metadata?.dropdowns.availability.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {metadata?.dropdowns.statuses.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="tapped_on">Tapped On</label>
              <input
                type="date"
                id="tapped_on"
                value={formData.tapped_on}
                onChange={(e) => handleInputChange('tapped_on', e.target.value)}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="style">Style</label>
              <select
                id="style"
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
              >
                <option value="">Select a style...</option>
                {metadata?.dropdowns.styles.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="abv">ABV</label>
              <input
                type="text"
                id="abv"
                value={formData.abv}
                onChange={(e) => handleInputChange('abv', e.target.value)}
                placeholder="5.2%"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="ibu">IBU</label>
              <input
                type="text"
                id="ibu"
                value={formData.ibu}
                onChange={(e) => handleInputChange('ibu', e.target.value)}
                placeholder="35"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="srm">SRM</label>
              <input
                type="text"
                id="srm"
                value={formData.srm}
                onChange={(e) => handleInputChange('srm', e.target.value)}
                placeholder="8"
              />
            </div>
          </div>
          
          {/* Toggles */}
          <div className={styles.toggleGroup}>
            <div className={styles.toggleItem}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                />
                Featured
              </label>
            </div>
            <div className={styles.toggleItem}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.barrel_aged}
                  onChange={(e) => handleInputChange('barrel_aged', e.target.checked)}
                />
                Barrel Aged
              </label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={styles.section}>
          <h2>Description</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="brief_description">Brief Description</label>
              <textarea
                id="brief_description"
                value={formData.brief_description}
                onChange={(e) => handleInputChange('brief_description', e.target.value)}
                rows={3}
                placeholder="Short description for cards and lists..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="aroma">Aroma</label>
              <textarea
                id="aroma"
                value={formData.aroma}
                onChange={(e) => handleInputChange('aroma', e.target.value)}
                rows={3}
                placeholder="Describe the beer's aroma..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="flavor_profile">Flavor Profile</label>
              <textarea
                id="flavor_profile"
                value={formData.flavor_profile}
                onChange={(e) => handleInputChange('flavor_profile', e.target.value)}
                rows={3}
                placeholder="Describe the flavor characteristics..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="appearance">Appearance</label>
              <textarea
                id="appearance"
                value={formData.appearance}
                onChange={(e) => handleInputChange('appearance', e.target.value)}
                rows={3}
                placeholder="Describe the visual appearance..."
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className={styles.section}>
          <h2>Ingredients</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="malts">Malts</label>
              <textarea
                id="malts"
                value={formData.malts}
                onChange={(e) => handleInputChange('malts', e.target.value)}
                rows={3}
                placeholder="List the malts used..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="hops">Hops</label>
              <textarea
                id="hops"
                value={formData.hops}
                onChange={(e) => handleInputChange('hops', e.target.value)}
                rows={3}
                placeholder="List the hops used..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="yeast">Yeast</label>
              <textarea
                id="yeast"
                value={formData.yeast}
                onChange={(e) => handleInputChange('yeast', e.target.value)}
                rows={3}
                placeholder="Describe the yeast used..."
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.section}>
          <h2>Content</h2>
          <div className={styles.formGroup}>
            <label htmlFor="content">About Section</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={15}
              placeholder={`# ${formData.name}

## Introduction

[Write an engaging introduction about this beer...]

## Brewing Notes

[Describe the brewing process, techniques, or special considerations...]

## Food Pairings

- [Food pairing 1]
- [Food pairing 2]
- [Food pairing 3]`}
            />
          </div>
        </div>

        {/* Awards */}
        <div className={styles.section}>
          <h2>Awards</h2>
          <div className={styles.formGroup}>
            <label htmlFor="awards">Awards & Recognition</label>
            <textarea
              id="awards"
              value={formData.awards}
              onChange={(e) => handleInputChange('awards', e.target.value)}
              rows={3}
              placeholder="List any awards, medals, or recognition received..."
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={saving} className={styles.saveButton}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link to="/admin" className={styles.cancelButton}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminBeerEditPage;
