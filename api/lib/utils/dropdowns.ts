import dropdowns from '../config/dropdowns.json';
import type { DropdownOptions, DropdownOption, DropdownStyleOption } from '../types/Admin';

export function getDropdownOptions(): DropdownOptions {
  return dropdowns as DropdownOptions;
}

export function getStatusOptions(): DropdownOption[] {
  return dropdowns.statuses;
}

export function getAvailabilityOptions(): DropdownOption[] {
  return dropdowns.availability;
}

export function getStyleOptions(): DropdownStyleOption[] {
  return dropdowns.styles;
}

export function getBarrelAgedOptions(): DropdownOption[] {
  return dropdowns.barrel_aged;
}

export function getStylesByCategory(): Record<string, DropdownStyleOption[]> {
  const styles = getStyleOptions();
  const categories: Record<string, DropdownStyleOption[]> = {};
  
  styles.forEach(style => {
    if (!categories[style.category]) {
      categories[style.category] = [];
    }
    categories[style.category].push(style);
  });
  
  return categories;
}

export function getStyleCategories(): string[] {
  const styles = getStyleOptions();
  const categories = new Set(styles.map(style => style.category));
  return Array.from(categories).sort();
}

export function findStatusByValue(value: string): DropdownOption | undefined {
  return getStatusOptions().find(status => status.value === value);
}

export function findAvailabilityByValue(value: string): DropdownOption | undefined {
  return getAvailabilityOptions().find(availability => availability.value === value);
}

export function findStyleByValue(value: string): DropdownStyleOption | undefined {
  return getStyleOptions().find(style => style.value === value);
}

export function findBarrelAgedByValue(value: boolean): DropdownOption | undefined {
  return getBarrelAgedOptions().find(option => option.value === value);
}

export function isValidStatus(value: string): boolean {
  return getStatusOptions().some(status => status.value === value);
}

export function isValidAvailability(value: string): boolean {
  return getAvailabilityOptions().some(availability => availability.value === value);
}

export function isValidStyle(value: string): boolean {
  return getStyleOptions().some(style => style.value === value);
}

export function isValidBarrelAged(value: boolean): boolean {
  return getBarrelAgedOptions().some(option => option.value === value);
}

export function getStatusColor(value: string): string {
  const status = findStatusByValue(value);
  return status?.color || '#6b7280';
}

export function getStatusLabel(value: string): string {
  const status = findStatusByValue(value);
  return status?.label || value;
}

export function getAvailabilityLabel(value: string): string {
  const availability = findAvailabilityByValue(value);
  return availability?.label || value;
}

export function getStyleLabel(value: string): string {
  const style = findStyleByValue(value);
  return style?.label || value;
}

export function getBarrelAgedLabel(value: boolean): string {
  const option = findBarrelAgedByValue(value);
  return option?.label || (value ? 'Yes' : 'No');
}

export function getStyleCategory(value: string): string {
  const style = findStyleByValue(value);
  return style?.category || 'Other';
}

export function searchStyles(query: string): DropdownStyleOption[] {
  const styles = getStyleOptions();
  const lowerQuery = query.toLowerCase();
  
  return styles.filter(style => 
    style.label.toLowerCase().includes(lowerQuery) ||
    style.category.toLowerCase().includes(lowerQuery)
  );
}

export function getPopularStyles(): DropdownStyleOption[] {
  const popularStyleNames = [
    'American IPA',
    'New England IPA',
    'American Pale Ale',
    'American Lager',
    'Pilsner',
    'Stout',
    'Porter',
    'Wheat Beer'
  ];
  
  return getStyleOptions().filter(style => 
    popularStyleNames.includes(style.value as string)
  );
}

export function getStylesByPopularity(): DropdownStyleOption[] {
  const styles = getStyleOptions();
  
  // Sort by category first, then by name
  return styles.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.label.localeCompare(b.label);
  });
}

export function validateDropdownValues(beer: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (beer.status && !isValidStatus(beer.status)) {
    errors.push(`Invalid status: ${beer.status}`);
  }
  
  if (beer.availability && !isValidAvailability(beer.availability)) {
    errors.push(`Invalid availability: ${beer.availability}`);
  }
  
  if (beer.style && !isValidStyle(beer.style)) {
    errors.push(`Invalid style: ${beer.style}`);
  }
  
  if (beer.barrel_aged !== undefined && !isValidBarrelAged(beer.barrel_aged)) {
    errors.push(`Invalid barrel_aged value: ${beer.barrel_aged}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getDropdownOptionsForForm(): {
  statuses: DropdownOption[];
  availability: DropdownOption[];
  styles: DropdownStyleOption[];
  barrel_aged: DropdownOption[];
} {
  return {
    statuses: getStatusOptions(),
    availability: getAvailabilityOptions(),
    styles: getStylesByPopularity(),
    barrel_aged: getBarrelAgedOptions()
  };
}
