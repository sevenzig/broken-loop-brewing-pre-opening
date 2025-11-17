import type { 
  ContentItem, 
  ContentType, 
  ContentValidationResult,
  ValidationRule,
  ValidationSchema 
} from '../types/ContentManager';

export class ValidationService {
  private schemas: Map<ContentType, ValidationSchema> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    this.setupDefaultSchemas();
    this.initialized = true;
    console.log('ValidationService initialized successfully');
  }

  async validateContent(content: ContentItem): Promise<ContentValidationResult> {
    await this.initialize();
    
    const schema = this.schemas.get(content.type);
    if (!schema) {
      return {
        isValid: true,
        errors: [],
        warnings: [`No validation schema found for content type: ${content.type}`]
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    for (const field of schema.required) {
      if (!this.hasValue(content.metadata, field)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate field rules
    for (const [field, rules] of Object.entries(schema.fields)) {
      const value = this.getValue(content.metadata, field);
      
      for (const rule of rules) {
        const result = this.validateRule(value, rule, field);
        if (result && result.level === 'error') {
          errors.push(result.message);
        } else if (result && result.level === 'warning') {
          warnings.push(result.message);
        }
      }
    }

    // Validate content body
    if (schema.contentRules) {
      for (const rule of schema.contentRules) {
        const result = this.validateRule(content.content, rule, 'content');
        if (result && result.level === 'error') {
          errors.push(result.message);
        } else if (result && result.level === 'warning') {
          warnings.push(result.message);
        }
      }
    }

    // Custom validation for specific content types
    const customValidation = await this.validateCustomRules(content);
    errors.push(...customValidation.errors);
    warnings.push(...customValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateRule(value: any, rule: ValidationRule, fieldName: string): { level: 'error' | 'warning'; message: string } | null {
    switch (rule.type) {
      case 'required':
        if (!this.hasValue({ [fieldName]: value }, fieldName)) {
          return { level: 'error', message: rule.message || `${fieldName} is required` };
        }
        break;

      case 'string':
        if (value !== undefined && value !== null && typeof value !== 'string') {
          return { level: 'error', message: rule.message || `${fieldName} must be a string` };
        }
        break;

      case 'number':
        if (value !== undefined && value !== null && (typeof value !== 'number' || isNaN(value))) {
          return { level: 'error', message: rule.message || `${fieldName} must be a number` };
        }
        break;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { level: 'error', message: rule.message || `${fieldName} must be a valid email` };
        }
        break;

      case 'url':
        if (value && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value)) {
          return { level: 'error', message: rule.message || `${fieldName} must be a valid URL` };
        }
        break;

      case 'date':
        if (value && isNaN(Date.parse(value))) {
          return { level: 'error', message: rule.message || `${fieldName} must be a valid date` };
        }
        break;

      case 'enum':
        if (value && rule.values && !rule.values.includes(value)) {
          return { level: 'error', message: rule.message || `${fieldName} must be one of: ${rule.values.join(', ')}` };
        }
        break;

      case 'minLength':
        if (value && rule.value && value.length < rule.value) {
          return { level: 'error', message: rule.message || `${fieldName} must be at least ${rule.value} characters` };
        }
        break;

      case 'maxLength':
        if (value && rule.value && value.length > rule.value) {
          return { level: 'error', message: rule.message || `${fieldName} must be no more than ${rule.value} characters` };
        }
        break;

      case 'min':
        if (value !== undefined && rule.value && Number(value) < rule.value) {
          return { level: 'error', message: rule.message || `${fieldName} must be at least ${rule.value}` };
        }
        break;

      case 'max':
        if (value !== undefined && rule.value && Number(value) > rule.value) {
          return { level: 'error', message: rule.message || `${fieldName} must be no more than ${rule.value}` };
        }
        break;

      case 'pattern':
        if (value && rule.pattern && !rule.pattern.test(value)) {
          return { level: 'error', message: rule.message || `${fieldName} format is invalid` };
        }
        break;

      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value, fieldName);
          if (!result.isValid) {
            return { level: rule.level || 'error', message: result.message };
          }
        }
        break;
    }

    return null;
  }

  private async validateCustomRules(content: ContentItem): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (content.type) {
      case 'beer':
        await this.validateBeerContent(content, errors, warnings);
        break;
      case 'food':
        await this.validateFoodContent(content, errors, warnings);
        break;
      case 'event':
        await this.validateEventContent(content, errors, warnings);
        break;
    }

    return { errors, warnings };
  }

  private async validateBeerContent(content: ContentItem, errors: string[], warnings: string[]): Promise<void> {
    const metadata = content.metadata;

    // ABV validation
    if (metadata.abv) {
      const abv = parseFloat(metadata.abv.replace('%', ''));
      if (abv < 0 || abv > 20) {
        warnings.push('ABV seems unusually high or low for beer');
      }
    }

    // IBU validation
    if (metadata.ibu) {
      const ibu = parseInt(metadata.ibu);
      if (ibu < 0 || ibu > 120) {
        warnings.push('IBU seems unusually high or low for beer');
      }
    }

    // Style validation
    const validStyles = [
      'American IPA', 'New England IPA', 'Imperial Stout', 'Porter', 
      'Pale Ale', 'Lager', 'Wheat Beer', 'Sour', 'Belgian Tripel',
      'Pilsner', 'Brown Ale', 'Other'
    ];
    
    if (metadata.style && !validStyles.includes(metadata.style)) {
      warnings.push(`Beer style '${metadata.style}' is not in the standard list`);
    }

    // Required beer fields
    if (!metadata.name) {
      errors.push('Beer name is required');
    }

    if (!metadata.brief_description) {
      warnings.push('Beer should have a brief description');
    }

    // Content validation
    if (content.content.length < 50) {
      warnings.push('Beer description seems very short');
    }
  }

  private async validateFoodContent(content: ContentItem, errors: string[], warnings: string[]): Promise<void> {
    const metadata = content.metadata;

    // Price validation
    if (metadata.price) {
      const price = parseFloat(metadata.price.replace('$', ''));
      if (price < 0) {
        errors.push('Price cannot be negative');
      }
      if (price > 100) {
        warnings.push('Price seems unusually high');
      }
    }

    // Category validation
    const validCategories = ['appetizers', 'mains', 'sides', 'desserts', 'specials'];
    if (metadata.category && !validCategories.includes(metadata.category)) {
      errors.push(`Invalid food category: ${metadata.category}`);
    }

    // Required food fields
    if (!metadata.name) {
      errors.push('Food item name is required');
    }

    if (!metadata.category) {
      errors.push('Food item category is required');
    }
  }

  private async validateEventContent(content: ContentItem, errors: string[], warnings: string[]): Promise<void> {
    const metadata = content.metadata;

    // Date validation
    if (metadata.date) {
      const eventDate = new Date(metadata.date);
      const now = new Date();
      
      if (eventDate < now && metadata.status === 'upcoming') {
        warnings.push('Event date is in the past but status is still "upcoming"');
      }
    }

    // Time validation
    if (metadata.start_time && metadata.end_time) {
      const start = new Date(`2000-01-01T${metadata.start_time}`);
      const end = new Date(`2000-01-01T${metadata.end_time}`);
      
      if (start >= end) {
        errors.push('Event start time must be before end time');
      }
    }

    // Required event fields
    if (!metadata.name) {
      errors.push('Event name is required');
    }

    if (!metadata.date) {
      errors.push('Event date is required');
    }
  }

  private setupDefaultSchemas(): void {
    // Beer validation schema
    this.schemas.set('beer', {
      required: ['name', 'slug', 'status'],
      fields: {
        name: [
          { type: 'required' },
          { type: 'string' },
          { type: 'minLength', value: 2 },
          { type: 'maxLength', value: 100 }
        ],
        slug: [
          { type: 'required' },
          { type: 'string' },
          { type: 'pattern', pattern: /^[a-z0-9-]+$/, message: 'Slug must contain only lowercase letters, numbers, and hyphens' }
        ],
        abv: [
          { type: 'string' },
          { type: 'pattern', pattern: /^\d+\.?\d*%?$/, message: 'ABV must be a number with optional % sign' }
        ],
        ibu: [
          { type: 'string' },
          { type: 'pattern', pattern: /^\d+$/, message: 'IBU must be a number' }
        ],
        status: [
          { type: 'required' },
          { type: 'enum', values: ['on-tap', 'coming-soon', 'seasonal', 'archived'] }
        ],
        style: [
          { type: 'string' },
          { type: 'minLength', value: 2 }
        ],
        image: [
          { type: 'string' },
          { type: 'pattern', pattern: /^\/[^/].*\.(jpg|jpeg|png|webp)$/i, message: 'Image must be a valid image path' }
        ]
      },
      contentRules: [
        { type: 'minLength', value: 20, message: 'Content should be at least 20 characters' }
      ]
    });

    // Food validation schema
    this.schemas.set('food', {
      required: ['name', 'category', 'status'],
      fields: {
        name: [
          { type: 'required' },
          { type: 'string' },
          { type: 'minLength', value: 2 },
          { type: 'maxLength', value: 100 }
        ],
        category: [
          { type: 'required' },
          { type: 'enum', values: ['appetizers', 'mains', 'sides', 'desserts', 'specials'] }
        ],
        status: [
          { type: 'required' },
          { type: 'enum', values: ['available', 'unavailable', 'seasonal', 'archived'] }
        ],
        price: [
          { type: 'string' },
          { type: 'pattern', pattern: /^\$?\d+\.?\d*$/, message: 'Price must be a valid currency amount' }
        ],
        slug: [
          { type: 'string' },
          { type: 'pattern', pattern: /^[a-z0-9-]+$/, message: 'Slug must contain only lowercase letters, numbers, and hyphens' }
        ]
      },
      contentRules: [
        { type: 'minLength', value: 10, message: 'Content should be at least 10 characters' }
      ]
    });

    // Event validation schema
    this.schemas.set('event', {
      required: ['name', 'date', 'status'],
      fields: {
        name: [
          { type: 'required' },
          { type: 'string' },
          { type: 'minLength', value: 2 },
          { type: 'maxLength', value: 100 }
        ],
        date: [
          { type: 'required' },
          { type: 'date' }
        ],
        status: [
          { type: 'required' },
          { type: 'enum', values: ['upcoming', 'ongoing', 'completed', 'cancelled'] }
        ],
        start_time: [
          { type: 'string' },
          { type: 'pattern', pattern: /^\d{2}:\d{2}$/, message: 'Start time must be in HH:MM format' }
        ],
        end_time: [
          { type: 'string' },
          { type: 'pattern', pattern: /^\d{2}:\d{2}$/, message: 'End time must be in HH:MM format' }
        ],
        slug: [
          { type: 'string' },
          { type: 'pattern', pattern: /^[a-z0-9-]+$/, message: 'Slug must contain only lowercase letters, numbers, and hyphens' }
        ]
      },
      contentRules: [
        { type: 'minLength', value: 20, message: 'Content should be at least 20 characters' }
      ]
    });
  }

  private hasValue(obj: any, path: string): boolean {
    const value = this.getValue(obj, path);
    return value !== undefined && value !== null && value !== '';
  }

  private getValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Public methods for adding custom validation
  addValidationSchema(type: ContentType, schema: ValidationSchema): void {
    this.schemas.set(type, schema);
  }

  addValidationRule(type: ContentType, field: string, rule: ValidationRule): void {
    const schema = this.schemas.get(type);
    if (schema) {
      if (!schema.fields[field]) {
        schema.fields[field] = [];
      }
      schema.fields[field].push(rule);
    }
  }
}