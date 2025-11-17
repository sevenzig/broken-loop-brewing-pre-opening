export interface Food {
    slug: string;
    name: string;
    image: string;
    price: string;
    category: string;
    brief_description: string;
    ingredients: string;
    prep_time: string;
    spice_level: string;
    dietary_notes?: string;
    featured?: boolean;
    available?: boolean;
    content?: string;
    filePath?: string;
}
export interface FoodStats {
    total: number;
    specials: number;
    appetizers: number;
    mains: number;
    sides: number;
    available: number;
}
/**
 * Load and process all food markdown files from subdirectories
 * Uses Vite's import.meta.glob for build-time processing
 */
export declare function loadAllFood(): Promise<Food[]>;
/**
 * Clear the food cache (useful for development)
 */
export declare function clearFoodCache(): void;
/**
 * Load a single food item by slug
 */
export declare function loadFoodBySlug(slug: string): Promise<Food | undefined>;
/**
 * Filter food by category
 */
export declare function filterFoodByCategory(foodItems: Food[], category: string): Food[];
/**
 * Get available food items
 */
export declare function getAvailableFood(foodItems: Food[]): Food[];
/**
 * Get food items by spice level
 */
export declare function getFoodBySpiceLevel(foodItems: Food[], spiceLevel: string): Food[];
/**
 * Get food statistics
 */
export declare function getFoodStats(foodItems: Food[]): FoodStats;
