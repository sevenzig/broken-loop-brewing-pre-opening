// Centralized data imports to ensure all markdown files are included in production builds
// This is a fallback for when import.meta.glob doesn't work reliably in production

// Import all beer markdown files
import goldenWheatMd from './beers/golden-wheat.md?raw';
import midnightStoutMd from './beers/midnight-stout.md?raw';
import hoppyTrailsIpaMd from './beers/hoppy-trails-ipa.md?raw';

// Import all food markdown files (add more as needed)
// import sampleFoodMd from './food/category/sample.md?raw';

export const beerMarkdownFiles = {
  '/src/data/beers/golden-wheat.md': goldenWheatMd,
  '/src/data/beers/midnight-stout.md': midnightStoutMd,
  '/src/data/beers/hoppy-trails-ipa.md': hoppyTrailsIpaMd,
};

export const foodMarkdownFiles = {
  // Add food markdown files here when available
  // '/src/data/food/category/sample.md': sampleFoodMd,
};

// Function to get all beer files (fallback when import.meta.glob fails)
export function getBeerFiles(): Record<string, string> {
  return beerMarkdownFiles;
}

// Function to get all food files (fallback when import.meta.glob fails)
export function getFoodFiles(): Record<string, string> {
  return foodMarkdownFiles;
} 