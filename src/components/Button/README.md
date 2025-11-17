# Button Component

A standardized, reusable Button component with four variants and three sizes.

## Features

- **Four Variants**: primary, secondary, tertiary, transparent
- **Three Sizes**: small, medium, large
- **Full Width Support**: Can span the full width of its container
- **Link Support**: Can render as an anchor tag when `href` is provided
- **Accessibility**: Proper focus states and reduced motion support
- **Responsive**: Mobile-optimized sizing
- **TypeScript**: Fully typed with TypeScript interfaces

## Usage

```tsx
import { Button } from '../components/Button';

// Basic usage
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

// With size
<Button variant="secondary" size="large" onClick={handleClick}>
  Large Button
</Button>

// As a link
<Button variant="primary" href="/beers" target="_blank">
  View Beers
</Button>

// Full width
<Button variant="tertiary" fullWidth onClick={handleClick}>
  Full Width Button
</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'transparent'` | `'primary'` | Button style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `children` | `React.ReactNode` | - | Button content |
| `onClick` | `() => void` | - | Click handler |
| `disabled` | `boolean` | `false` | Disable the button |
| `loading` | `boolean` | `false` | Show loading spinner and disable button |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `className` | `string` | - | Additional CSS classes |
| `fullWidth` | `boolean` | `false` | Make button full width |
| `href` | `string` | - | Render as anchor tag if provided |
| `target` | `string` | - | Target for anchor tag |
| `rel` | `string` | - | Rel attribute for anchor tag |

## Variants

### Primary
- Background: `var(--color-primary)` (#1a4d5c)
- Text: White
- Hover: Darker primary color with enhanced shadow

### Secondary
- Background: Transparent
- Text: Primary color
- Border: 2px solid primary color
- Hover: Primary background with white text

### Tertiary (Order Button)
- Background: `var(--color-secondary)` (#d4af37)
- Text: White
- Hover: Darker secondary color with shadow

### Transparent
- Background: Transparent
- Text: Default text color
- Border: 1px solid border color
- Hover: Light background with primary text color

## Sizes

### Small
- Padding: `var(--spacing-xs) var(--spacing-sm)`
- Font size: `var(--font-size-sm)`
- Min height: 36px

### Medium (Default)
- Padding: `var(--spacing-sm) var(--spacing-md)`
- Font size: `var(--font-size-base)`
- Min height: 44px

### Large
- Padding: `var(--spacing-md) var(--spacing-lg)`
- Font size: `var(--font-size-lg)`
- Min height: 52px

## Examples

### Basic Buttons
```tsx
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="tertiary">Tertiary Button</Button>
<Button variant="transparent">Transparent Button</Button>
```

### Different Sizes
```tsx
<Button variant="primary" size="small">Small</Button>
<Button variant="primary" size="medium">Medium</Button>
<Button variant="primary" size="large">Large</Button>
```

### Link Buttons
```tsx
<Button variant="primary" href="/beers">View Beers</Button>
<Button variant="secondary" href="/events" target="_blank">Events</Button>
```

### Form Buttons
```tsx
<Button type="submit" variant="primary">Submit</Button>
<Button type="reset" variant="secondary">Reset</Button>
```

### Loading State
```tsx
<Button variant="primary" loading>Loading...</Button>
```

### Disabled State
```tsx
<Button variant="primary" disabled>Disabled Button</Button>
```

### Full Width
```tsx
<Button variant="primary" fullWidth>Full Width Button</Button>
```

## CSS Custom Properties Used

The component uses the following CSS custom properties from your global styles:

- `--color-primary`
- `--color-primary-hover`
- `--color-secondary`
- `--color-secondary-hover`
- `--color-text`
- `--color-border`
- `--color-background-hover`
- `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`
- `--font-size-sm`, `--font-size-base`, `--font-size-lg`
- `--border-radius`
- `--transition-speed`
- `--transition-timing`
- `--touch-target-min`
- `--shadow-md`

## Accessibility

- Proper focus states with visible outlines
- Reduced motion support for users with motion sensitivity
- Minimum touch target size of 44px
- Semantic HTML (button or anchor tags)
- Proper ARIA attributes when needed
- Loading states disable interaction and show visual feedback

## Migration from Existing Buttons

To migrate existing buttons to use this component:

1. Replace `<button className={styles.primaryButton}>` with `<Button variant="primary">`
2. Replace `<button className={styles.secondaryButton}>` with `<Button variant="secondary">`
3. Replace `<button className={styles.orderButton}>` with `<Button variant="tertiary">`
4. For transparent/ghost buttons, use `<Button variant="transparent">`

The existing CSS classes in your module files will remain untouched, allowing for gradual migration. 