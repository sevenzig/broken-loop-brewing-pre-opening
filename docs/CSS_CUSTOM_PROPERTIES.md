# CSS Custom Properties Reference

## Overview

This document provides a complete reference of all CSS custom properties (CSS variables) used in the Broken Loop Brewing website. These variables ensure consistency across components and make the design system easily maintainable.

## 🎨 Colors

### Primary Colors
```css
--color-primary: #1a4d5c;           /* Main brand color - dark teal */
--color-primary-hover: #2a5d6c;     /* Primary color hover state */
--color-secondary: #d4af37;         /* Accent color - gold */
--color-secondary-hover: #c49a2a;   /* Secondary color hover state */
```

### Background Colors
```css
--color-background: #ffffff;                    /* Main background - white */
--color-background-secondary: #f8f9fa;         /* Secondary background - light gray */
--color-background-hover: #f1f3f4;             /* Hover background - lighter gray */
```

### Text Colors
```css
--color-text: #333333;              /* Primary text color - dark gray */
--color-text-secondary: #666666;    /* Secondary text color - medium gray */
```

### UI Colors
```css
--color-border: #e0e0e0;            /* Border color - light gray */
--color-success: #28a745;           /* Success state - green */
--color-warning: #ffc107;           /* Warning state - yellow */
--color-error: #dc3545;             /* Error state - red */
```

## 🍺 Beer-Specific Colors

### SRM Color Scale (Standard Reference Method)
Beer color scale from light to dark:

```css
--srm-1: #f3f993;   /* Very light - Pilsner */
--srm-2: #f5f75c;   /* Light - Wheat beer */
--srm-3: #f6f513;   /* Light - Blonde ale */
--srm-4: #eae615;   /* Light - Golden ale */
--srm-5: #e0d01b;   /* Light - Pale ale */
--srm-6: #d5bc26;   /* Light - Amber ale */
--srm-7: #cdaa37;   /* Medium - Brown ale */
--srm-8: #c1963c;   /* Medium - Porter */
--srm-9: #be8c3a;   /* Medium - Stout */
--srm-10: #be823a;  /* Medium - Dark stout */
--srm-11: #c17a37;  /* Dark - Imperial stout */
--srm-12: #bf7138;  /* Dark - Black IPA */
--srm-13: #bc6733;  /* Dark - Baltic porter */
--srm-14: #b26033;  /* Dark - Russian imperial stout */
--srm-15: #a85839;  /* Very dark - Extra stout */
--srm-16: #a6543a;  /* Very dark - Double stout */
--srm-17: #9f4f33;  /* Very dark - Triple stout */
--srm-18: #8d4c32;  /* Very dark - Quadruple stout */
--srm-19: #8c4a2f;  /* Very dark - Quintuple stout */
--srm-20: #7c452d;  /* Very dark - Sextuple stout */
--srm-21: #6b3a1e;  /* Very dark - Septuple stout */
--srm-22: #5d341a;  /* Very dark - Octuple stout */
--srm-23: #4e2a0c;  /* Very dark - Nonuple stout */
--srm-24: #4a280b;  /* Very dark - Decuple stout */
--srm-25: #45260a;  /* Very dark - Undecuple stout */
--srm-26: #42250a;  /* Very dark - Duodecuple stout */
--srm-27: #3f2309;  /* Very dark - Tredecuple stout */
--srm-28: #3c2108;  /* Very dark - Quattuordecuple stout */
--srm-29: #381f08;  /* Very dark - Quindecuple stout */
--srm-30: #361e07;  /* Very dark - Sexdecuple stout */
--srm-31: #321c06;  /* Very dark - Septendecuple stout */
--srm-32: #2f1a05;  /* Very dark - Octodecuple stout */
--srm-33: #2d1805;  /* Very dark - Novemdecuple stout */
--srm-34: #2a1704;  /* Very dark - Vigintuple stout */
--srm-35: #281504;  /* Very dark - Unvigintuple stout */
--srm-36: #251404;  /* Very dark - Duovigintuple stout */
--srm-37: #231203;  /* Very dark - Trevigintuple stout */
--srm-38: #201002;  /* Very dark - Quattuorvigintuple stout */
--srm-39: #1e0f02;  /* Very dark - Quinvigintuple stout */
--srm-40: #1b0e01;  /* Very dark - Sexvigintuple stout */
```

### IBU Color Scale (International Bitterness Units)
Beer bitterness scale from low to very high:

```css
--ibu-low: #90ee90;         /* Low bitterness - Light green */
--ibu-medium-low: #7dd87d;  /* Medium-low bitterness */
--ibu-medium: #6bc26b;      /* Medium bitterness */
--ibu-medium-high: #59ac59; /* Medium-high bitterness */
--ibu-high: #479647;        /* High bitterness */
--ibu-very-high: #358035;   /* Very high bitterness - Dark green */
```

## 📏 Spacing Scale

```css
--spacing-xs: 0.25rem;   /* 4px - Extra small spacing */
--spacing-sm: 0.5rem;    /* 8px - Small spacing */
--spacing-md: 1rem;      /* 16px - Medium spacing (base) */
--spacing-lg: 2rem;      /* 32px - Large spacing */
--spacing-xl: 4rem;      /* 64px - Extra large spacing */
--spacing-xxl: 6rem;     /* 96px - Extra extra large spacing */
```

## 📝 Typography

### Font Families
```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes
```css
--font-size-xs: 0.75rem;    /* 12px - Extra small text */
--font-size-sm: 0.875rem;   /* 14px - Small text */
--font-size-base: 1rem;     /* 16px - Base text size */
--font-size-lg: 1.125rem;   /* 18px - Large text */
--font-size-xl: 1.5rem;     /* 24px - Extra large text */
--font-size-xxl: 2.25rem;   /* 36px - Extra extra large text */
--font-size-xxxl: 3rem;     /* 48px - Extra extra extra large text */
```

### Line Heights
```css
--line-height-tight: 1.25;      /* Tight line spacing */
--line-height-normal: 1.5;      /* Normal line spacing */
--line-height-relaxed: 1.75;    /* Relaxed line spacing */
```

## 🏗️ Layout

### Container
```css
--container-max-width: 1200px;           /* Maximum content width */
--container-padding-mobile: 1rem;        /* Mobile container padding */
--container-padding-tablet: 2rem;        /* Tablet container padding */
--container-padding-desktop: 2rem;       /* Desktop container padding */
```

## 🔲 Border & Radius

```css
--border-radius: 8px;        /* Standard border radius */
--border-radius-sm: 4px;     /* Small border radius */
--border-radius-lg: 12px;    /* Large border radius */
--border-width: 1px;         /* Standard border width */
```

## 🌫️ Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);      /* Small shadow */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);       /* Medium shadow */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);     /* Large shadow */
```

## ⚡ Transitions

```css
--transition-speed: 0.3s;        /* Standard transition duration */
--transition-timing: ease-in-out; /* Standard transition timing function */
```

## 📱 Z-Index Scale

```css
--z-dropdown: 100;    /* Dropdown menus */
--z-modal: 1000;      /* Modal dialogs */
--z-header: 1100;     /* Fixed header */
--z-tooltip: 1200;    /* Tooltips */
```

## 👆 Touch Targets

```css
--touch-target-min: 44px;    /* Minimum touch target size for mobile */
```

## 📱 Breakpoints

### Main Breakpoint Values
```css
--breakpoint-mobile: 480px;              /* Mobile portrait max */
--breakpoint-mobile-landscape: 768px;    /* Mobile landscape max */
--breakpoint-tablet: 1024px;             /* Tablet max */
--breakpoint-desktop: 1200px;            /* Desktop max */
```

### Breakpoint Ranges (for Media Queries)
```css
--breakpoint-mobile-max: 480px;              /* Mobile portrait max */
--breakpoint-mobile-landscape-min: 481px;    /* Mobile landscape min */
--breakpoint-mobile-landscape-max: 768px;    /* Mobile landscape max */
--breakpoint-tablet-min: 769px;              /* Tablet min */
--breakpoint-tablet-max: 1024px;             /* Tablet max */
--breakpoint-desktop-min: 1025px;            /* Desktop min */
--breakpoint-desktop-max: 1200px;            /* Desktop max */
--breakpoint-desktop-large-min: 1201px;      /* Desktop large min */
```

## 🎯 Usage Examples

### Button Component
```css
.button {
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  transition: all var(--transition-speed) var(--transition-timing);
  min-height: var(--touch-target-min);
  box-shadow: var(--shadow-sm);
}

.button:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}
```

### Card Component
```css
.card {
  background: var(--color-background);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-speed) var(--transition-timing);
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

### Section Layout
```css
.section {
  width: 100%;
  padding: var(--spacing-xl) 0;
}

.sectionContent {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding-mobile);
}

@media (min-width: var(--breakpoint-tablet-min)) {
  .sectionContent {
    padding: 0 var(--container-padding-tablet);
  }
}

@media (min-width: var(--breakpoint-desktop-min)) {
  .sectionContent {
    padding: 0 var(--container-padding-desktop);
  }
}
```

### Typography Scale
```css
.title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-md);
}

.subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-sm);
}
```

## 🎨 Color Usage Guidelines

### Primary Brand Colors
- **`--color-primary`**: Use for main actions, links, and brand elements
- **`--color-secondary`**: Use for accents, highlights, and secondary actions

### Background Colors
- **`--color-background`**: Main page background
- **`--color-background-secondary`**: Card backgrounds, section backgrounds
- **`--color-background-hover`**: Hover states for interactive elements

### Text Colors
- **`--color-text`**: Primary text content
- **`--color-text-secondary`**: Secondary text, captions, metadata

### Status Colors
- **`--color-success`**: Success messages, confirmations
- **`--color-warning`**: Warning messages, alerts
- **`--color-error`**: Error messages, destructive actions

## 📱 Responsive Design

### Breakpoint Usage
```css
/* Mobile Portrait - 320px to 480px */
@media (max-width: var(--breakpoint-mobile-max)) {
  /* Mobile-specific styles */
}

/* Mobile Landscape / Small Tablet - 481px to 768px */
@media (min-width: var(--breakpoint-mobile-landscape-min)) and (max-width: var(--breakpoint-mobile-landscape-max)) {
  /* Mobile landscape styles */
}

/* Tablet - 769px to 1024px */
@media (min-width: var(--breakpoint-tablet-min)) and (max-width: var(--breakpoint-tablet-max)) {
  /* Tablet styles */
}

/* Desktop Small - 1025px to 1200px */
@media (min-width: var(--breakpoint-desktop-min)) and (max-width: var(--breakpoint-desktop-max)) {
  /* Desktop small styles */
}

/* Desktop Large - 1201px+ */
@media (min-width: var(--breakpoint-desktop-large-min)) {
  /* Desktop large styles */
}
```

## 🔧 Best Practices

### 1. Always Use Variables
```css
/* ✅ CORRECT */
.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
}

/* ❌ INCORRECT */
.button {
  background: #1a4d5c;
  padding: 16px;
}
```

### 2. Consistent Spacing
```css
/* ✅ CORRECT */
.card {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
}

/* ❌ INCORRECT */
.card {
  margin-bottom: 32px;
  padding: 16px;
}
```

### 3. Semantic Color Usage
```css
/* ✅ CORRECT */
.success-message {
  color: var(--color-success);
}

.error-message {
  color: var(--color-error);
}

/* ❌ INCORRECT */
.success-message {
  color: #28a745;
}

.error-message {
  color: #dc3545;
}
```

### 4. Responsive Breakpoints
```css
/* ✅ CORRECT */
@media (max-width: var(--breakpoint-mobile-max)) {
  .component {
    padding: var(--spacing-sm);
  }
}

/* ❌ INCORRECT */
@media (max-width: 480px) {
  .component {
    padding: 8px;
  }
}
```

## 📚 Related Documentation

- [Responsive Design Standards](./RESPONSIVE_DESIGN_STANDARDS.md)
- [Breakpoint Standardization Summary](../BREAKPOINT_STANDARDIZATION_SUMMARY.md)
- [CSS Best Practices](../.cursor/rules/cssBestPractices.mdc)

---

**Note**: All CSS custom properties are defined in `src/styles/globals.css` and should be used consistently across all components to maintain design system integrity. 