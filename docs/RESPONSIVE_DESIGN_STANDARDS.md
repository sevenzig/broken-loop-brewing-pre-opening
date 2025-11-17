# Responsive Design Standards

## Overview

This document outlines the standardized responsive design system used across the Broken Loop Brewing website. All components must follow these patterns to ensure consistency, maintainability, and optimal user experience across all devices.

## Breakpoint Standards

### Mandatory Breakpoint Structure

All components must use these **exact** breakpoints:

```css
/* Mobile Portrait - 320px to 480px */
@media (max-width: var(--breakpoint-mobile-max)) {
  /* Single column, touch-optimized */
}

/* Mobile Landscape / Small Tablet - 481px to 768px */  
@media (min-width: var(--breakpoint-mobile-landscape-min)) and (max-width: var(--breakpoint-mobile-landscape-max)) {
  /* Still mobile layout but slightly larger */
}

/* Tablet - 769px to 1024px */
@media (min-width: var(--breakpoint-tablet-min)) and (max-width: var(--breakpoint-tablet-max)) {
  /* Desktop-style header, multi-column content */
}

/* Desktop Small - 1025px to 1200px */
@media (min-width: var(--breakpoint-desktop-min)) and (max-width: var(--breakpoint-desktop-max)) {
  /* Full desktop layout */
}

/* Desktop Large - 1201px+ */
@media (min-width: var(--breakpoint-desktop-large-min)) {
  /* Maximum width containers, optimal spacing */
}
```

### CSS Custom Properties

Always use CSS custom properties instead of hardcoded values:

```css
/* ✅ CORRECT - Using CSS custom properties */
@media (max-width: var(--breakpoint-mobile-max)) { }

/* ❌ INCORRECT - Hardcoded values */
@media (max-width: 480px) { }
```

### Available Breakpoint Variables

```css
:root {
  /* Main breakpoint values */
  --breakpoint-mobile: 480px;
  --breakpoint-mobile-landscape: 768px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1200px;
  
  /* Breakpoint ranges for media queries */
  --breakpoint-mobile-max: 480px;
  --breakpoint-mobile-landscape-min: 481px;
  --breakpoint-mobile-landscape-max: 768px;
  --breakpoint-tablet-min: 769px;
  --breakpoint-tablet-max: 1024px;
  --breakpoint-desktop-min: 1025px;
  --breakpoint-desktop-max: 1200px;
  --breakpoint-desktop-large-min: 1201px;
}
```

## Layout Patterns

### Component Container Pattern

Every component should follow this structure:

```css
.component {
  width: 100%;
  padding: var(--spacing-lg) 0;
}

.componentContent {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding-mobile);
}

/* Mobile Landscape / Small Tablet */
@media (min-width: var(--breakpoint-mobile-landscape-min)) and (max-width: var(--breakpoint-mobile-landscape-max)) {
  .componentContent {
    padding: 0 var(--container-padding-tablet);
  }
}

/* Tablet */
@media (min-width: var(--breakpoint-tablet-min)) and (max-width: var(--breakpoint-tablet-max)) {
  .componentContent {
    padding: 0 var(--container-padding-tablet);
  }
}

/* Desktop */
@media (min-width: var(--breakpoint-desktop-min)) {
  .componentContent {
    padding: 0 var(--container-padding-desktop);
  }
}
```

### Grid System

Use CSS Grid for responsive layouts:

```css
.contentGrid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: 1fr; /* Mobile: 1 column */
}

/* Mobile Landscape: 2 columns */
@media (min-width: var(--breakpoint-mobile-landscape-min)) and (max-width: var(--breakpoint-mobile-landscape-max)) {
  .contentGrid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Tablet: 3 columns */
@media (min-width: var(--breakpoint-tablet-min)) and (max-width: var(--breakpoint-tablet-max)) {
  .contentGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop: 4 columns */
@media (min-width: var(--breakpoint-desktop-min)) {
  .contentGrid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Typography Scaling

Scale typography responsively:

```css
.title {
  font-size: var(--font-size-xl); /* Base size */
}

/* Mobile Portrait */
@media (max-width: var(--breakpoint-mobile-max)) {
  .title {
    font-size: var(--font-size-lg);
  }
}

/* Desktop */
@media (min-width: var(--breakpoint-desktop-min)) {
  .title {
    font-size: var(--font-size-xxl);
  }
}
```

## Touch Targets

Ensure minimum touch targets on mobile:

```css
.button,
.clickableElement {
  min-height: var(--touch-target-min); /* 44px */
  min-width: var(--touch-target-min);
  padding: var(--spacing-sm) var(--spacing-md);
}

/* Only enforce on mobile */
@media (max-width: var(--breakpoint-mobile-landscape-max)) {
  .button,
  .clickableElement {
    min-height: var(--touch-target-min);
    min-width: var(--touch-target-min);
  }
}
```

## Accessibility Considerations

### Reduced Motion

Always include reduced motion support:

```css
@media (prefers-reduced-motion: reduce) {
  .component {
    transition: none;
  }
  
  .component:hover {
    transform: none;
  }
}
```

### Print Styles

Include print styles for better accessibility:

```css
@media print {
  .component {
    background: white;
    color: black;
  }
  
  .title {
    color: black;
  }
  
  .description {
    color: #333;
  }
}
```

## Component Examples

### ResponsiveTemplate Component

See `src/components/ResponsiveTemplate/` for a complete example of proper responsive implementation.

### Header Component

The header demonstrates mobile/desktop switching:

```css
/* Mobile header (≤ 768px) */
@media (max-width: var(--breakpoint-mobile-landscape-max)) {
  .headerDesktop {
    display: none;
  }
  
  .headerMobile {
    display: block;
  }
}

/* Desktop header (≥ 769px) */
@media (min-width: var(--breakpoint-tablet-min)) {
  .headerDesktop {
    display: block;
  }
  
  .headerMobile {
    display: none;
  }
}
```

## Testing Guidelines

### Breakpoint Testing

Test each component at these specific viewport widths:

- **320px** - Small mobile
- **480px** - Mobile portrait max
- **481px** - Mobile landscape min
- **768px** - Mobile landscape max
- **769px** - Tablet min
- **1024px** - Tablet max
- **1025px** - Desktop small min
- **1200px** - Desktop small max
- **1201px** - Desktop large min
- **1400px** - Large desktop

### Browser Testing

Test on:
- Chrome DevTools responsive mode
- Firefox responsive design mode
- Safari responsive design mode
- Physical devices when possible

## Code Review Checklist

Before committing responsive code, ensure:

- [ ] Uses exact breakpoint values from standards
- [ ] Uses CSS custom properties instead of hardcoded values
- [ ] Follows mobile-first CSS approach
- [ ] Includes reduced motion support
- [ ] Includes print styles
- [ ] Touch targets meet 44px minimum on mobile
- [ ] Typography scales appropriately
- [ ] Grid layouts adapt correctly
- [ ] No non-standard breakpoints
- [ ] Consistent spacing across breakpoints

## Migration Guide

### Converting Existing Components

1. **Replace hardcoded breakpoints:**
   ```css
   /* Before */
   @media (max-width: 480px) { }
   
   /* After */
   @media (max-width: var(--breakpoint-mobile-max)) { }
   ```

2. **Add missing breakpoints:**
   ```css
   /* Add if missing */
   @media (min-width: var(--breakpoint-desktop-large-min)) { }
   ```

3. **Update comments:**
   ```css
   /* Before */
   /* Mobile */
   
   /* After */
   /* Mobile Portrait - 320px to 480px */
   ```

4. **Add accessibility features:**
   ```css
   @media (prefers-reduced-motion: reduce) { }
   @media print { }
   ```

## Resources

- [ResponsiveTemplate Component](../src/components/ResponsiveTemplate/)
- [CSS Custom Properties](../src/styles/globals.css)
- [Breakpoint Standards](../.cursor/rules/responsiveBreakpointStandards.mdc)

---

**Remember:** Consistency is key. All components must follow these standards to maintain a cohesive user experience across all devices. 