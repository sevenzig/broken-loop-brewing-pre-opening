import type { DropdownOptions, DropdownOption, DropdownStyleOption } from '../types/Admin';
export declare function getDropdownOptions(): DropdownOptions;
export declare function getStatusOptions(): DropdownOption[];
export declare function getAvailabilityOptions(): DropdownOption[];
export declare function getStyleOptions(): DropdownStyleOption[];
export declare function getBarrelAgedOptions(): DropdownOption[];
export declare function getStylesByCategory(): Record<string, DropdownStyleOption[]>;
export declare function getStyleCategories(): string[];
export declare function findStatusByValue(value: string): DropdownOption | undefined;
export declare function findAvailabilityByValue(value: string): DropdownOption | undefined;
export declare function findStyleByValue(value: string): DropdownStyleOption | undefined;
export declare function findBarrelAgedByValue(value: boolean): DropdownOption | undefined;
export declare function isValidStatus(value: string): boolean;
export declare function isValidAvailability(value: string): boolean;
export declare function isValidStyle(value: string): boolean;
export declare function isValidBarrelAged(value: boolean): boolean;
export declare function getStatusColor(value: string): string;
export declare function getStatusLabel(value: string): string;
export declare function getAvailabilityLabel(value: string): string;
export declare function getStyleLabel(value: string): string;
export declare function getBarrelAgedLabel(value: boolean): string;
export declare function getStyleCategory(value: string): string;
export declare function searchStyles(query: string): DropdownStyleOption[];
export declare function getPopularStyles(): DropdownStyleOption[];
export declare function getStylesByPopularity(): DropdownStyleOption[];
export declare function validateDropdownValues(beer: any): {
    isValid: boolean;
    errors: string[];
};
export declare function getDropdownOptionsForForm(): {
    statuses: DropdownOption[];
    availability: DropdownOption[];
    styles: DropdownStyleOption[];
    barrel_aged: DropdownOption[];
};
//# sourceMappingURL=dropdowns.d.ts.map