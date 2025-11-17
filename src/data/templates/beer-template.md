---
# Beer Information Template - All Available Options

# Basic Information
name: 'Beer Name Here' # Required: Beer name as displayed
image: '/images/beers/beer-slug.png' # Required: Path to beer image (svg, jpg, png)
slug: 'beer-slug' # Required: URL slug (lowercase, hyphens only)

# Beer Specifications
abv: '5.2%' # Required: Alcohol by volume (include % symbol)
ibu: '25' # Required: International Bitterness Units (0-120+ typical range)
srm: '8' # Required: Standard Reference Method color (1-40+ scale)
style: 'American Pale Ale' # Required: Beer style classification

# Status & Availability
status: 'on-tap' # Required: "on-tap" | "seasonal" | "coming-soon" | "limited-edition" | "sold-out" | "archived" | "retired"
availability: 'Year-round' # Optional: "Year-round" | "Spring" | "Summer" | "Fall" | "Winter" | "Limited" | "Seasonal"
tapped_on: '2024-01-15' # Optional: Date format YYYY-MM-DD

barrel_aged: false # Optional: true | false (shows barrel aged badge, overrides other badges)

# Descriptions
brief_description:
  'Brief description for beer cards and previews (1-2 sentences recommended).'
# Required: Short description for cards and previews

# Brewing Details (All Optional)
hops: 'Cascade, Centennial, Chinook' # Optional: Hop varieties used
malts: '2-Row Pale Malt, Munich Malt, Crystal 60L' # Optional: Malt types (can duplicate grain_bill)
yeast: 'Safale US-05 American Ale' # Optional: Yeast strain used

# Tasting Notes (All Optional)
flavor_profile: 'Balanced malt sweetness with citrusy hop character and a clean
  finish' # Optional: Flavor description
aroma: 'Floral and citrus hop aroma with subtle malt backbone' # Optional: Aroma description
appearance: 'Golden amber with a persistent off-white head' # Optional: Visual description

# Additional Notes:
# - All text fields support basic HTML in content body below frontmatter
# - Images should be optimized for web (recommended: 400x600px)
# - SRM values: 1=pale yellow, 4=golden, 8=amber, 15=copper, 20=brown, 30+=black
# - IBU values: <20=low, 20-40=medium, 40-60=high, 60+=very high
# - Status affects badge color: on-tap=green, seasonal=orange, coming-soon=purple, limited-edition=red, sold-out=gray, retired=gray
# - Featured beers appear with special badge and may be highlighted in listings
# - Slug must be unique and match the filename (without .md extension)
# - Date format for tapped_on: YYYY-MM-DD
# - All brewing details and tasting notes are optional but recommended for completeness
---

# Full Beer Description

This is where you can add a longer, more detailed description of the beer. This
content supports **markdown formatting** including:

- **Bold text**
- _Italic text_
- Lists (like this one)
- Links to other pages

## Brewing Notes

You can add sections about the brewing process, or any other relevant information about the beer.

## Food Pairings

Suggest foods that pair well with this beer style.
