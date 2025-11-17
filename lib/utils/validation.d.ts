import type { Beer, BeerFormData, BeerValidationResult, BeerValidationError } from '../types/Beer';
export declare function validateBeer(beer: BeerFormData, existingBeers?: Beer[]): BeerValidationResult;
export declare function validateUUID(uuid: string, existingBeers?: Beer[]): BeerValidationResult;
export declare function generateUUID(beerName: string, style: string): string;
export declare function validateImageUpload(file: any): BeerValidationError[];
export declare function sanitizeBeerData(beer: any): BeerFormData;
//# sourceMappingURL=validation.d.ts.map