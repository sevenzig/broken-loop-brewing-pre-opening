import matter from 'gray-matter';
import type { Beer, BeerFormData } from '../types/Beer';
import { generateUUID } from './validation';

export interface MarkdownFile {
  frontmatter: Beer;
  content: string;
  markdown: string;
}

export function parseMarkdownFile(markdown: string): MarkdownFile {
  const { data, content } = matter(markdown);
  
  // Ensure all required fields are present with defaults
  const frontmatter: Beer = {
    uuid: data.uuid || '',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    name: data.name || '',
    image: data.image || '',
    slug: data.slug || '',
    abv: data.abv || '',
    ibu: data.ibu || '',
    srm: data.srm || '',
    style: data.style || '',
    status: data.status || 'coming-soon',
    brief_description: data.brief_description || '',
    availability: data.availability,
    tapped_on: data.tapped_on,
    barrel_aged: data.barrel_aged,
    hops: data.hops,
    malts: data.malts,
    yeast: data.yeast,
    flavor_profile: data.flavor_profile,
    aroma: data.aroma,
    appearance: data.appearance,
    // Legacy fields
    grain_bill: data.grain_bill,
    featured: data.featured || false
  };

  return {
    frontmatter,
    content: content.trim(),
    markdown
  };
}

export function generateMarkdownFile(beer: BeerFormData, content: string = ''): string {
  const now = new Date().toISOString();
  
  // Generate UUID if not provided
  const uuid = beer.uuid || generateUUID(beer.name, beer.style);
  
  // Prepare frontmatter object
  const frontmatter: any = {
    uuid,
    created_at: (beer as any).created_at || now,
    updated_at: now,
    name: beer.name,
    image: beer.image,
    slug: beer.slug,
    abv: beer.abv,
    ibu: beer.ibu,
    srm: beer.srm,
    style: beer.style,
    status: beer.status,
    brief_description: beer.brief_description
  };

  // Add optional fields only if they have values
  if (beer.availability) frontmatter.availability = beer.availability;
  if (beer.tapped_on) frontmatter.tapped_on = beer.tapped_on;
  if (beer.barrel_aged !== undefined) frontmatter.barrel_aged = beer.barrel_aged;
  if (beer.hops) frontmatter.hops = beer.hops;
  if (beer.malts) frontmatter.malts = beer.malts;
  if (beer.yeast) frontmatter.yeast = beer.yeast;
  if (beer.flavor_profile) frontmatter.flavor_profile = beer.flavor_profile;
  if (beer.aroma) frontmatter.aroma = beer.aroma;
  if (beer.appearance) frontmatter.appearance = beer.appearance;
  
  // Legacy fields
  if (beer.grain_bill) frontmatter.grain_bill = beer.grain_bill;
  if (beer.featured !== undefined) frontmatter.featured = beer.featured;

  // Generate markdown using gray-matter
  const markdown = matter.stringify(content, frontmatter);
  
  return markdown;
}

export function updateMarkdownFile(existingMarkdown: string, updates: Partial<BeerFormData>, newContent?: string): string {
  const { data: frontmatter, content } = matter(existingMarkdown);
  
  // Update frontmatter with new values
  const updatedFrontmatter = {
    ...frontmatter,
    ...updates,
    updated_at: new Date().toISOString()
  };

  // Use new content if provided, otherwise keep existing
  const finalContent = newContent !== undefined ? newContent : content;
  
  // Generate updated markdown
  return matter.stringify(finalContent, updatedFrontmatter);
}

export function extractBeerFromMarkdown(markdown: string): Beer {
  const { data } = matter(markdown);
  
  return {
    uuid: data.uuid || '',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    name: data.name || '',
    image: data.image || '',
    slug: data.slug || '',
    abv: data.abv || '',
    ibu: data.ibu || '',
    srm: data.srm || '',
    style: data.style || '',
    status: data.status || 'coming-soon',
    brief_description: data.brief_description || '',
    availability: data.availability,
    tapped_on: data.tapped_on,
    barrel_aged: data.barrel_aged,
    hops: data.hops,
    malts: data.malts,
    yeast: data.yeast,
    flavor_profile: data.flavor_profile,
    aroma: data.aroma,
    appearance: data.appearance,
    grain_bill: data.grain_bill,
    featured: data.featured || false
  };
}

export function generateDefaultContent(beer: BeerFormData): string {
  return `# ${beer.name} - ${beer.style}

${beer.brief_description}

## Brewing Notes

[Add brewing notes here]

## Food Pairings

- [Add food pairing suggestions]

## Technical Details

- **ABV:** ${beer.abv}
- **IBU:** ${beer.ibu}
- **SRM:** ${beer.srm}
${beer.hops ? `- **Hops:** ${beer.hops}` : ''}
${beer.malts ? `- **Malts:** ${beer.malts}` : ''}
${beer.yeast ? `- **Yeast:** ${beer.yeast}` : ''}
${beer.flavor_profile ? `- **Flavor Profile:** ${beer.flavor_profile}` : ''}
${beer.aroma ? `- **Aroma:** ${beer.aroma}` : ''}
${beer.appearance ? `- **Appearance:** ${beer.appearance}` : ''}
`;
}

export function validateMarkdownStructure(markdown: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const { data } = matter(markdown);
    
    // Check required fields
    const requiredFields = ['name', 'image', 'slug', 'abv', 'ibu', 'srm', 'style', 'status', 'brief_description'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Check UUID format if present
    if (data.uuid && !/^[a-z0-9-]+-[a-z0-9-]+$/.test(data.uuid)) {
      errors.push('Invalid UUID format. Must be: {beer-slug}-{style-slug}');
    }
    
    // Check date formats
    if (data.created_at && !isValidISOString(data.created_at)) {
      errors.push('Invalid created_at date format. Must be ISO string.');
    }
    
    if (data.updated_at && !isValidISOString(data.updated_at)) {
      errors.push('Invalid updated_at date format. Must be ISO string.');
    }
    
    if (data.tapped_on && !/^\d{4}-\d{2}-\d{2}$/.test(data.tapped_on)) {
      errors.push('Invalid tapped_on date format. Must be YYYY-MM-DD.');
    }
    
  } catch (error) {
    errors.push(`Failed to parse markdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function isValidISOString(str: string): boolean {
  try {
    const date = new Date(str);
    return date.toISOString() === str;
  } catch {
    return false;
  }
}

export function generateFileName(beer: BeerFormData): string {
  const uuid = beer.uuid || generateUUID(beer.name, beer.style);
  return `${uuid}.md`;
}

export function extractUUIDFromFileName(fileName: string): string | null {
  const match = fileName.match(/^([a-z0-9-]+-[a-z0-9-]+)\.md$/);
  return match ? match[1] : null;
}
