# InfoTabs Full-Width Debugging Guide

## Issue Description
The InfoTabs component is not rendering as full-page width like other homepage components. It appears as a contained card instead of spanning the entire viewport.

## Debugging Workflow

### 1. Visual Inspection
- [ ] Check browser dev tools to see if debug borders are visible
- [ ] Red border = .infoTabsSection (should span full width)
- [ ] Blue border = .sectionContent (should span full width)
- [ ] Green border = .infoTabs (should span full width)

### 2. CSS Cascade Check
- [ ] Inspect element in dev tools
- [ ] Check if any parent elements are constraining width
- [ ] Verify no `max-width` properties are overriding `width: 100%`
- [ ] Check if any CSS custom properties are undefined

### 3. Responsive Breakpoint Test
- [ ] Test at mobile width (< 480px)
- [ ] Test at tablet width (481px - 768px)
- [ ] Test at desktop width (769px+)
- [ ] Verify full-width behavior at all breakpoints

### 4. Component Structure Verification
```tsx
// Expected structure:
<section className={styles.infoTabsSection}>
  <div className={styles.sectionContent}>
    <div className={styles.infoTabs}>
      {/* tab content */}
    </div>
  </div>
</section>
```

### 5. CSS Variables Check
- [ ] Verify `--container-padding-mobile` is defined
- [ ] Verify `--container-padding-tablet` is defined  
- [ ] Verify `--container-padding-desktop` is defined
- [ ] Verify `--color-background-secondary` is defined

### 6. Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in mobile browsers

### 7. Build Process Check
- [ ] Verify CSS is being compiled correctly
- [ ] Check for any build errors
- [ ] Clear browser cache
- [ ] Hard refresh (Ctrl+F5)

## Expected Behavior
- InfoTabs should span the entire viewport width
- Should have consistent padding on sides
- Should match the full-width pattern of other homepage sections
- Should be responsive at all breakpoints

## Troubleshooting Steps

### If debug borders are not visible:
1. Check if CSS is loading
2. Verify component is rendering
3. Check for JavaScript errors

### If only partial width:
1. Check parent container constraints
2. Verify CSS specificity
3. Check for conflicting styles

### If responsive issues:
1. Test viewport meta tag
2. Check media query syntax
3. Verify breakpoint values

## Files to Check
- `src/components/InfoTabs/InfoTabs.module.css`
- `src/components/InfoTabs/InfoTabs.tsx`
- `src/pages/HomePage.tsx`
- `src/styles/globals.css`

## Next Steps
1. Remove debug borders after confirming full-width behavior
2. Test with real content
3. Verify accessibility
4. Performance testing 