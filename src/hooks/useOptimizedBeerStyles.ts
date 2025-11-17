import { useState, useEffect, useMemo } from 'react';

export interface BeerStyleInfo {
  style_code: string;
  style_name: string;
  category: string;
  category_name: string;
  overall_impression: string;
  aroma?: string;
  appearance?: string;
  flavor?: string;
  mouthfeel?: string;
  history?: string;
  comments?: string;
  vital_stats?: {
    og: string;
    fg: string;
    ibu: string;
    srm: string;
    abv: string;
  };
  commercial_examples?: {
    american?: string[];
    english?: string[];
    other?: string[];
  };
  tags?: string[];
  content?: string; // Pre-processed HTML content
  markdown?: string; // Original markdown for admin editing
  slug: string;
}

/**
 * Optimized hook that uses pre-processed JSON data for beer styles
 * This eliminates runtime markdown processing from the client bundle
 */
export function useOptimizedBeerStyles() {
  const [allStyles, setAllStyles] = useState<BeerStyleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStyles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/data/beer-styles.json');
      if (!response.ok) {
        throw new Error(`Failed to load beer styles: ${response.status} ${response.statusText}`);
      }
      
      const stylesData = await response.json();
      setAllStyles(stylesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load beer styles';
      setError(errorMessage);
      console.error('Error loading beer styles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStyles();
  }, []);

  return {
    allStyles,
    loading,
    error,
    reload: loadStyles,
  };
}

/**
 * Optimized hook for getting a single beer style by code using pre-processed data
 */
export function useOptimizedBeerStyle(styleCode: string) {
  const { allStyles, loading, error } = useOptimizedBeerStyles();

  const style = useMemo(() => {
    if (!styleCode || allStyles.length === 0) return null;
    
    // Handle different input formats:
    // - "10B" (just the code)
    // - "10B-dunkles-weissbier" (with description)
    let targetCode = styleCode;
    
    // If it contains a dash, extract just the code part
    if (styleCode.includes('-')) {
      const codeMatch = styleCode.match(/^(\d+[A-Za-z])-/);
      if (codeMatch) {
        targetCode = codeMatch[1];
      }
    }
    
    // Normalize the target code to lowercase for comparison
    const normalizedTargetCode = targetCode.toLowerCase();
    
    // Find the matching style
    return allStyles.find(style => 
      style.style_code.toLowerCase() === normalizedTargetCode ||
      style.slug === styleCode.toLowerCase()
    ) || null;
  }, [allStyles, styleCode]);

  return {
    style,
    loading,
    error,
  };
}

/**
 * Optimized hook for getting beer style info by style name (for tooltip usage)
 */
export function useOptimizedBeerStyleByName(styleName: string) {
  const { allStyles, loading, error } = useOptimizedBeerStyles();

  const style = useMemo(() => {
    if (!styleName || allStyles.length === 0) return null;
    
    // First try to find by exact style name
    const exactMatch = allStyles.find(style => 
      style.style_name.toLowerCase() === styleName.toLowerCase()
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // Try partial match if exact match not found
    const partialMatch = allStyles.find(style => 
      style.style_name.toLowerCase().includes(styleName.toLowerCase()) ||
      styleName.toLowerCase().includes(style.style_name.toLowerCase())
    );
    
    return partialMatch || null;
  }, [allStyles, styleName]);

  return {
    style,
    loading,
    error,
  };
}

/**
 * Create fallback style info when style is not found
 */
export function createFallbackStyleInfo(styleName: string): BeerStyleInfo {
  return {
    style_code: '',
    style_name: styleName,
    category: '',
    category_name: '',
    overall_impression: `${styleName} is a distinctive beer style with unique characteristics. This style represents a specific brewing tradition with its own flavor profile, appearance, and brewing techniques. For detailed information about this and other beer styles, consult the BJCP Style Guidelines.`,
    slug: styleName.toLowerCase().replace(/\s+/g, '-'),
  };
}

