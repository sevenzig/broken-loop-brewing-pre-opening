import dropdowns from '../config/dropdowns.json';
export function getDropdownOptions() {
    return dropdowns;
}
export function getStatusOptions() {
    return dropdowns.statuses;
}
export function getAvailabilityOptions() {
    return dropdowns.availability;
}
export function getStyleOptions() {
    return dropdowns.styles;
}
export function getBarrelAgedOptions() {
    return dropdowns.barrel_aged;
}
export function getStylesByCategory() {
    const styles = getStyleOptions();
    const categories = {};
    styles.forEach(style => {
        if (!categories[style.category]) {
            categories[style.category] = [];
        }
        categories[style.category].push(style);
    });
    return categories;
}
export function getStyleCategories() {
    const styles = getStyleOptions();
    const categories = new Set(styles.map(style => style.category));
    return Array.from(categories).sort();
}
export function findStatusByValue(value) {
    return getStatusOptions().find(status => status.value === value);
}
export function findAvailabilityByValue(value) {
    return getAvailabilityOptions().find(availability => availability.value === value);
}
export function findStyleByValue(value) {
    return getStyleOptions().find(style => style.value === value);
}
export function findBarrelAgedByValue(value) {
    return getBarrelAgedOptions().find(option => option.value === value);
}
export function isValidStatus(value) {
    return getStatusOptions().some(status => status.value === value);
}
export function isValidAvailability(value) {
    return getAvailabilityOptions().some(availability => availability.value === value);
}
export function isValidStyle(value) {
    return getStyleOptions().some(style => style.value === value);
}
export function isValidBarrelAged(value) {
    return getBarrelAgedOptions().some(option => option.value === value);
}
export function getStatusColor(value) {
    const status = findStatusByValue(value);
    return status?.color || '#6b7280';
}
export function getStatusLabel(value) {
    const status = findStatusByValue(value);
    return status?.label || value;
}
export function getAvailabilityLabel(value) {
    const availability = findAvailabilityByValue(value);
    return availability?.label || value;
}
export function getStyleLabel(value) {
    const style = findStyleByValue(value);
    return style?.label || value;
}
export function getBarrelAgedLabel(value) {
    const option = findBarrelAgedByValue(value);
    return option?.label || (value ? 'Yes' : 'No');
}
export function getStyleCategory(value) {
    const style = findStyleByValue(value);
    return style?.category || 'Other';
}
export function searchStyles(query) {
    const styles = getStyleOptions();
    const lowerQuery = query.toLowerCase();
    return styles.filter(style => style.label.toLowerCase().includes(lowerQuery) ||
        style.category.toLowerCase().includes(lowerQuery));
}
export function getPopularStyles() {
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
    return getStyleOptions().filter(style => popularStyleNames.includes(style.value));
}
export function getStylesByPopularity() {
    const styles = getStyleOptions();
    // Sort by category first, then by name
    return styles.sort((a, b) => {
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
        }
        return a.label.localeCompare(b.label);
    });
}
export function validateDropdownValues(beer) {
    const errors = [];
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
export function getDropdownOptionsForForm() {
    return {
        statuses: getStatusOptions(),
        availability: getAvailabilityOptions(),
        styles: getStylesByPopularity(),
        barrel_aged: getBarrelAgedOptions()
    };
}
//# sourceMappingURL=dropdowns.js.map