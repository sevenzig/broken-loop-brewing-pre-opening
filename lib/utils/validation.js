import dropdowns from '../config/dropdowns.json';
export function validateBeer(beer, existingBeers = []) {
    const errors = [];
    // Required field validation
    if (!beer.name?.trim()) {
        errors.push({ field: 'name', message: 'Name is required' });
    }
    if (!beer.image?.trim()) {
        errors.push({ field: 'image', message: 'Image path is required' });
    }
    if (!beer.abv?.trim()) {
        errors.push({ field: 'abv', message: 'ABV is required' });
    }
    if (!beer.ibu?.trim()) {
        errors.push({ field: 'ibu', message: 'IBU is required' });
    }
    if (!beer.srm?.trim()) {
        errors.push({ field: 'srm', message: 'SRM is required' });
    }
    if (!beer.style?.trim()) {
        errors.push({ field: 'style', message: 'Style is required' });
    }
    if (!beer.status) {
        errors.push({ field: 'status', message: 'Status is required' });
    }
    if (!beer.brief_description?.trim()) {
        errors.push({ field: 'brief_description', message: 'Brief description is required' });
    }
    // Slug validation
    if (!beer.slug?.trim()) {
        errors.push({ field: 'slug', message: 'Slug is required' });
    }
    else {
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(beer.slug)) {
            errors.push({
                field: 'slug',
                message: 'Slug must contain only lowercase letters, numbers, and hyphens',
                value: beer.slug
            });
        }
        // Check for slug uniqueness (excluding current beer if editing)
        const existingSlug = existingBeers.find(b => b.slug === beer.slug && b.uuid !== beer.uuid);
        if (existingSlug) {
            errors.push({
                field: 'slug',
                message: `Slug "${beer.slug}" is already in use by "${existingSlug.name}"`,
                value: beer.slug
            });
        }
    }
    // Dropdown validation
    const dropdownOptions = dropdowns;
    if (beer.status && !dropdownOptions.statuses.some(s => s.value === beer.status)) {
        errors.push({
            field: 'status',
            message: `Invalid status. Must be one of: ${dropdownOptions.statuses.map(s => s.value).join(', ')}`,
            value: beer.status
        });
    }
    if (beer.style && !dropdownOptions.styles.some(s => s.value === beer.style)) {
        errors.push({
            field: 'style',
            message: `Invalid style. Must be one of: ${dropdownOptions.styles.map(s => s.value).join(', ')}`,
            value: beer.style
        });
    }
    if (beer.availability && !dropdownOptions.availability.some(a => a.value === beer.availability)) {
        errors.push({
            field: 'availability',
            message: `Invalid availability. Must be one of: ${dropdownOptions.availability.map(a => a.value).join(', ')}`,
            value: beer.availability
        });
    }
    if (beer.barrel_aged !== undefined && !dropdownOptions.barrel_aged.some(b => b.value === beer.barrel_aged)) {
        errors.push({
            field: 'barrel_aged',
            message: 'Barrel aged must be true or false',
            value: beer.barrel_aged
        });
    }
    // Date validation
    if (beer.tapped_on) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(beer.tapped_on)) {
            errors.push({
                field: 'tapped_on',
                message: 'Tapped on date must be in YYYY-MM-DD format',
                value: beer.tapped_on
            });
        }
        else {
            const date = new Date(beer.tapped_on);
            if (isNaN(date.getTime())) {
                errors.push({
                    field: 'tapped_on',
                    message: 'Invalid date',
                    value: beer.tapped_on
                });
            }
        }
    }
    // ABV validation
    if (beer.abv) {
        const abvRegex = /^\d+(\.\d+)?%?$/;
        if (!abvRegex.test(beer.abv)) {
            errors.push({
                field: 'abv',
                message: 'ABV must be a number with optional % symbol (e.g., 6.8 or 6.8%)',
                value: beer.abv
            });
        }
        else {
            const abvValue = parseFloat(beer.abv.replace('%', ''));
            if (abvValue < 0 || abvValue > 100) {
                errors.push({
                    field: 'abv',
                    message: 'ABV must be between 0 and 100',
                    value: beer.abv
                });
            }
        }
    }
    // IBU validation
    if (beer.ibu) {
        const ibuValue = parseInt(beer.ibu);
        if (isNaN(ibuValue) || ibuValue < 0 || ibuValue > 200) {
            errors.push({
                field: 'ibu',
                message: 'IBU must be a number between 0 and 200',
                value: beer.ibu
            });
        }
    }
    // SRM validation
    if (beer.srm) {
        const srmValue = parseInt(beer.srm);
        if (isNaN(srmValue) || srmValue < 0 || srmValue > 100) {
            errors.push({
                field: 'srm',
                message: 'SRM must be a number between 0 and 100',
                value: beer.srm
            });
        }
    }
    // Image path validation
    if (beer.image) {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp'];
        const hasValidExtension = validExtensions.some(ext => beer.image.toLowerCase().endsWith(ext));
        if (!hasValidExtension) {
            errors.push({
                field: 'image',
                message: `Image must have a valid extension: ${validExtensions.join(', ')}`,
                value: beer.image
            });
        }
        if (!beer.image.startsWith('/images/')) {
            errors.push({
                field: 'image',
                message: 'Image path must start with /images/',
                value: beer.image
            });
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
export function validateUUID(uuid, existingBeers = []) {
    const errors = [];
    if (!uuid?.trim()) {
        errors.push({ field: 'uuid', message: 'UUID is required' });
        return { isValid: false, errors };
    }
    // Check UUID format: {beer-slug}-{style-slug}
    const uuidRegex = /^[a-z0-9-]+-[a-z0-9-]+$/;
    if (!uuidRegex.test(uuid)) {
        errors.push({
            field: 'uuid',
            message: 'UUID must be in format: {beer-slug}-{style-slug}',
            value: uuid
        });
    }
    // Check for UUID uniqueness
    const existingUUID = existingBeers.find(b => b.uuid === uuid);
    if (existingUUID) {
        errors.push({
            field: 'uuid',
            message: `UUID "${uuid}" is already in use by "${existingUUID.name}"`,
            value: uuid
        });
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
export function generateUUID(beerName, style) {
    const slugify = (str) => str.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const beerSlug = slugify(beerName);
    const styleSlug = slugify(style);
    return `${beerSlug}-${styleSlug}`;
}
export function validateImageUpload(file) {
    const errors = [];
    if (!file) {
        errors.push({ field: 'image', message: 'Image file is required' });
        return errors;
    }
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        errors.push({
            field: 'image',
            message: 'Image file size must be less than 5MB',
            value: file.size
        });
    }
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        errors.push({
            field: 'image',
            message: `Image must be one of: ${allowedTypes.join(', ')}`,
            value: file.mimetype
        });
    }
    return errors;
}
export function sanitizeBeerData(beer) {
    return {
        name: beer.name?.trim() || '',
        image: beer.image?.trim() || '',
        slug: beer.slug?.trim() || '',
        abv: beer.abv?.trim() || '',
        ibu: beer.ibu?.trim() || '',
        srm: beer.srm?.trim() || '',
        style: beer.style?.trim() || '',
        status: beer.status || 'coming-soon',
        brief_description: beer.brief_description?.trim() || '',
        availability: beer.availability || undefined,
        tapped_on: beer.tapped_on?.trim() || undefined,
        barrel_aged: beer.barrel_aged !== undefined ? Boolean(beer.barrel_aged) : undefined,
        hops: beer.hops?.trim() || undefined,
        malts: beer.malts?.trim() || undefined,
        yeast: beer.yeast?.trim() || undefined,
        flavor_profile: beer.flavor_profile?.trim() || undefined,
        aroma: beer.aroma?.trim() || undefined,
        appearance: beer.appearance?.trim() || undefined,
        // Legacy fields
        grain_bill: beer.grain_bill?.trim() || undefined,
        featured: beer.featured !== undefined ? Boolean(beer.featured) : false
    };
}
//# sourceMappingURL=validation.js.map