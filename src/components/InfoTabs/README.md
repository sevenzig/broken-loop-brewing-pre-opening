# InfoTabs Component

A mobile-optimized tabbed component for displaying brewery information including hours, directions, and policies.

## Features

- **Mobile-first design** optimized for screens up to 375px width
- **Three tabs**: Hours, Directions, and Policies
- **Real-time status** showing current open/closed status
- **Interactive map** with Google Maps integration
- **Accessible** with proper ARIA labels and keyboard navigation
- **Responsive** design that scales to larger screens
- **Smooth animations** with reduced motion support

## Usage

```tsx
import InfoTabs from '../components/InfoTabs';

function MyPage() {
  const handleTabChange = (tab: 'hours' | 'directions' | 'policies') => {
    console.log('Active tab:', tab);
  };

  return (
    <InfoTabs 
      initialActiveTab="hours"
      onTabChange={handleTabChange}
      className="my-custom-class"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |
| `initialActiveTab` | `'hours' \| 'directions' \| 'policies'` | `'hours'` | Initial active tab |
| `onTabChange` | `(tab: string) => void` | `undefined` | Callback when tab changes |

## Tab Content

### Hours Tab
- Current open/closed status with visual indicator
- Weekly business hours in a clean grid layout
- Today's hours highlighted with different styling
- Kitchen closing time note

### Directions Tab
- Full address display
- Embedded Google Maps iframe
- Parking information
- Transit information
- Accessibility information
- "Get Directions" button linking to Google Maps

### Policies Tab
- Family friendly policy
- Pet policy
- Large party information
- Outdoor seating availability
- Live music venue information

## Data Source

The component uses `breweryInfo.ts` as the single source of truth for all data:
- Business hours from `breweryInfo.getBusinessHours()`
- Current status from `breweryInfo.getCurrentStatus()`
- Address and coordinates from `breweryInfo.address`
- Location features from `breweryInfo.location`

## Accessibility

- Proper ARIA labels and roles for screen readers
- Keyboard navigation support
- Focus management
- Reduced motion support
- Touch-friendly tap targets (44px minimum)

## Styling

Uses CSS Modules with the project's design system:
- CSS custom properties for colors, spacing, and typography
- Mobile-first responsive breakpoints
- Consistent with project's component architecture
- No external dependencies

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge) 