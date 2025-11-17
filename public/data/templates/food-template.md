---
# Food Item Template - All Available Options

# Basic Information
name: 'Food Item Name' # Required: Food item name as displayed
image: '/images/food/food-slug.jpg' # Required: Path to food image (jpg, png, svg)
slug: 'food-item-slug' # Required: URL slug (lowercase, hyphens only)
price: '$15.00' # Required: Price with currency symbol

# Categorization
category: 'mains' # Required: "appetizers" | "mains" | "sides" | "drinks" | "desserts"

# Display Options
featured: true # Required: true | false (shows featured badge)
available: true # Required: true | false (controls if item appears in menu)

# Descriptions
brief_description:
  'Short description for menu cards (1-2 sentences recommended).'
# Required: Brief description for cards and previews

# Food Details (All Optional)
ingredients: 'List of main ingredients separated by commas' # Optional: Ingredient list
prep_time: '15-20 minutes' # Optional: Preparation/cooking time
spice_level: 'mild' # Optional: "mild" | "medium" | "hot" | "very hot" | null
dietary_notes: 'Gluten-free, vegetarian options available' # Optional: Dietary information and modifications

# Additional Notes:
# - All text fields support basic HTML in content body below frontmatter
# - Images should be optimized for web (recommended: 400x400px square)
# - Categories determine which section the item appears in on the menu
# - Price format: Include currency symbol ($, €, £, etc.)
# - Spice levels: mild=green, medium=yellow, hot=orange, very hot=red (displayed as colored indicators)
# - Featured items may be highlighted in menu listings
# - Available=false hides item from public menu (useful for seasonal items)
# - Slug must be unique and match the filename (without .md extension)
# - Prep time helps customers set expectations
# - Dietary notes should include common allergens and modification options
# - Ingredients list helps with allergen identification
---

# Full Food Description

This is where you can add a longer, more detailed description of the food item.
This content supports **markdown formatting** including:

- **Bold text** for emphasis
- _Italic text_ for subtle highlights
- Lists for ingredients or preparation steps
- Links to related items or pages

## Preparation Details

You can describe the cooking method, special techniques, or what makes this dish
unique.

## Dietary Information

Include detailed allergen information, nutritional highlights, or modification
options:

- **Gluten-Free**: Available upon request
- **Vegetarian**: Can be made vegetarian by substituting...
- **Vegan**: Available with modifications
- **Contains**: List any major allergens

## Pairing Suggestions

Suggest beer pairings, side dishes, or complementary items from your menu.
