const fs = require('fs');
const path = require('path');

// Path to the main guidelines file
const GUIDELINES_FILE = './src/data/beers/style-guide/style_guidelines_bjcp_2021.md';
const OUTPUT_DIR = './src/data/beers/style-guide';

// Core BJCP styles (first 30 most important ones)
const CORE_STYLES = [
  { code: '1A', name: 'American Light Lager', category: '1', categoryName: 'Standard American Beer' },
  { code: '1B', name: 'American Lager', category: '1', categoryName: 'Standard American Beer' },
  { code: '1C', name: 'Cream Ale', category: '1', categoryName: 'Standard American Beer' },
  { code: '1D', name: 'American Wheat Beer', category: '1', categoryName: 'Standard American Beer' },
  { code: '2A', name: 'International Pale Lager', category: '2', categoryName: 'International Lager' },
  { code: '2B', name: 'International Amber Lager', category: '2', categoryName: 'International Lager' },
  { code: '2C', name: 'International Dark Lager', category: '2', categoryName: 'International Lager' },
  { code: '3A', name: 'Czech Pale Lager', category: '3', categoryName: 'Czech Lager' },
  { code: '3B', name: 'Czech Premium Pale Lager', category: '3', categoryName: 'Czech Lager' },
  { code: '3C', name: 'Czech Amber Lager', category: '3', categoryName: 'Czech Lager' },
  { code: '3D', name: 'Czech Dark Lager', category: '3', categoryName: 'Czech Lager' },
  { code: '4A', name: 'Munich Helles', category: '4', categoryName: 'Pale Malty European Lager' },
  { code: '4B', name: 'Festbier', category: '4', categoryName: 'Pale Malty European Lager' },
  { code: '4C', name: 'Helles Bock', category: '4', categoryName: 'Pale Malty European Lager' },
  { code: '5A', name: 'German Leichtbier', category: '5', categoryName: 'Pale Bitter European Beer' },
  { code: '5B', name: 'Kölsch', category: '5', categoryName: 'Pale Bitter European Beer' },
  { code: '5C', name: 'German Helles Exportbier', category: '5', categoryName: 'Pale Bitter European Beer' },
  { code: '5D', name: 'German Pils', category: '5', categoryName: 'Pale Bitter European Beer' },
  { code: '6A', name: 'Märzen', category: '6', categoryName: 'Amber Malty European Lager' },
  { code: '6B', name: 'Rauchbier', category: '6', categoryName: 'Amber Malty European Lager' },
  { code: '6C', name: 'Dunkles Bock', category: '6', categoryName: 'Amber Malty European Lager' },
  { code: '7A', name: 'Vienna Lager', category: '7', categoryName: 'Amber Bitter European Beer' },
  { code: '7B', name: 'Altbier', category: '7', categoryName: 'Amber Bitter European Beer' },
  { code: '8A', name: 'Munich Dunkel', category: '8', categoryName: 'Dark European Lager' },
  { code: '8B', name: 'Schwarzbier', category: '8', categoryName: 'Dark European Lager' },
  { code: '9A', name: 'Doppelbock', category: '9', categoryName: 'Strong European Beer' },
  { code: '9B', name: 'Eisbock', category: '9', categoryName: 'Strong European Beer' },
  { code: '9C', name: 'Baltic Porter', category: '9', categoryName: 'Strong European Beer' },
  { code: '10A', name: 'Weissbier', category: '10', categoryName: 'German Wheat Beer' },
  { code: '10B', name: 'Dunkles Weissbier', category: '10', categoryName: 'German Wheat Beer' },
  { code: '10C', name: 'Weizenbock', category: '10', categoryName: 'German Wheat Beer' },
  { code: '11A', name: 'Ordinary Bitter', category: '11', categoryName: 'British Bitter' },
  { code: '11B', name: 'Best Bitter', category: '11', categoryName: 'British Bitter' },
  { code: '11C', name: 'Strong Bitter', category: '11', categoryName: 'British Bitter' },
  { code: '12A', name: 'British Golden Ale', category: '12', categoryName: 'Pale Commonwealth Beer' },
  { code: '12B', name: 'Australian Sparkling Ale', category: '12', categoryName: 'Pale Commonwealth Beer' },
  { code: '12C', name: 'English IPA', category: '12', categoryName: 'Pale Commonwealth Beer' },
  { code: '13A', name: 'Dark Mild', category: '13', categoryName: 'Brown British Beer' },
  { code: '13B', name: 'British Brown Ale', category: '13', categoryName: 'Brown British Beer' },
  { code: '13C', name: 'English Porter', category: '13', categoryName: 'Brown British Beer' },
  { code: '14A', name: 'Scottish Light', category: '14', categoryName: 'Scottish Ale' },
  { code: '14B', name: 'Scottish Heavy', category: '14', categoryName: 'Scottish Ale' },
  { code: '14C', name: 'Scottish Export', category: '14', categoryName: 'Scottish Ale' },
  { code: '15A', name: 'Irish Red Ale', category: '15', categoryName: 'Irish Beer' },
  { code: '15B', name: 'Irish Stout', category: '15', categoryName: 'Irish Beer' },
  { code: '15C', name: 'Irish Extra Stout', category: '15', categoryName: 'Irish Beer' },
  { code: '16A', name: 'Sweet Stout', category: '16', categoryName: 'Dark British Beer' },
  { code: '16B', name: 'Oatmeal Stout', category: '16', categoryName: 'Dark British Beer' },
  { code: '16C', name: 'Tropical Stout', category: '16', categoryName: 'Dark British Beer' },
  { code: '16D', name: 'Foreign Extra Stout', category: '16', categoryName: 'Dark British Beer' },
  { code: '17A', name: 'British Strong Ale', category: '17', categoryName: 'Strong British Ale' },
  { code: '17B', name: 'Old Ale', category: '17', categoryName: 'Strong British Ale' },
  { code: '17C', name: 'Wee Heavy', category: '17', categoryName: 'Strong British Ale' },
  { code: '17D', name: 'English Barley Wine', category: '17', categoryName: 'Strong British Ale' },
  { code: '18A', name: 'Blonde Ale', category: '18', categoryName: 'Pale American Ale' },
  { code: '18B', name: 'American Pale Ale', category: '18', categoryName: 'Pale American Ale' },
  { code: '19A', name: 'American Amber Ale', category: '19', categoryName: 'Amber and Brown American Beer' },
  { code: '19B', name: 'California Common', category: '19', categoryName: 'Amber and Brown American Beer' },
  { code: '19C', name: 'American Brown Ale', category: '19', categoryName: 'Amber and Brown American Beer' },
  { code: '20A', name: 'American Porter', category: '20', categoryName: 'American Porter and Stout' },
  { code: '20B', name: 'American Stout', category: '20', categoryName: 'American Porter and Stout' },
  { code: '20C', name: 'Imperial Stout', category: '20', categoryName: 'American Porter and Stout' },
  { code: '21A', name: 'American IPA', category: '21', categoryName: 'IPA' },
  { code: '21B', name: 'Specialty IPA', category: '21', categoryName: 'IPA' },
  { code: '21C', name: 'Hazy IPA', category: '21', categoryName: 'IPA' },
  { code: '22A', name: 'Double IPA', category: '22', categoryName: 'Strong American Ale' },
  { code: '22B', name: 'American Strong Ale', category: '22', categoryName: 'Strong American Ale' },
  { code: '22C', name: 'American Barleywine', category: '22', categoryName: 'Strong American Ale' },
  { code: '22D', name: 'Wheatwine', category: '22', categoryName: 'Strong American Ale' },
  { code: '23A', name: 'Berliner Weisse', category: '23', categoryName: 'European Sour Ale' },
  { code: '23B', name: 'Flanders Red Ale', category: '23', categoryName: 'European Sour Ale' },
  { code: '23C', name: 'Oud Bruin', category: '23', categoryName: 'European Sour Ale' },
  { code: '23D', name: 'Lambic', category: '23', categoryName: 'European Sour Ale' },
  { code: '23E', name: 'Gueuze', category: '23', categoryName: 'European Sour Ale' },
  { code: '23F', name: 'Fruit Lambic', category: '23', categoryName: 'European Sour Ale' },
  { code: '23G', name: 'Gose', category: '23', categoryName: 'European Sour Ale' },
  { code: '24A', name: 'Witbier', category: '24', categoryName: 'Belgian Ale' },
  { code: '24B', name: 'Belgian Pale Ale', category: '24', categoryName: 'Belgian Ale' },
  { code: '24C', name: 'Bière de Garde', category: '24', categoryName: 'Belgian Ale' },
  { code: '25A', name: 'Belgian Blond Ale', category: '25', categoryName: 'Strong Belgian Ale' },
  { code: '25B', name: 'Saison', category: '25', categoryName: 'Strong Belgian Ale' },
  { code: '25C', name: 'Belgian Golden Strong Ale', category: '25', categoryName: 'Strong Belgian Ale' },
  { code: '26A', name: 'Belgian Single', category: '26', categoryName: 'Monastic Ale' },
  { code: '26B', name: 'Belgian Dubbel', category: '26', categoryName: 'Monastic Ale' },
  { code: '26C', name: 'Belgian Tripel', category: '26', categoryName: 'Monastic Ale' },
  { code: '26D', name: 'Belgian Dark Strong Ale', category: '26', categoryName: 'Monastic Ale' }
];

// Function to create a placeholder markdown file for a style
function createPlaceholderStyle(style) {
  const fileName = `${style.code.toLowerCase()}-${style.name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.md`;

  const content = `---
style_code: "${style.code}"
style_name: "${style.name}"
category: "${style.category}"
category_name: "${style.categoryName}"
tags: ["${style.categoryName.toLowerCase().replace(/\s+/g, '-')}", "traditional-style"]
---

# ${style.code}. ${style.name}

## Overall Impression
${style.name} is a traditional beer style within the ${style.categoryName} category. This style represents specific brewing traditions and characteristics that define its unique profile within the broader beer landscape.

## Aroma
Characteristic aroma profile typical of ${style.name}, showing the distinctive qualities that define this style.

## Appearance
Visual characteristics typical of ${style.name}, with appropriate color, clarity, and head formation for the style.

## Flavor
Flavor profile characteristic of ${style.name}, balancing the key taste components that make this style distinctive.

## Mouthfeel
Mouthfeel characteristics typical of ${style.name}, with appropriate body, carbonation, and texture.

## Comments
${style.name} represents a well-defined style with specific characteristics that distinguish it from other beer styles.

## History
${style.name} has a brewing tradition that reflects the historical development of beer styles within the ${style.categoryName} category.

## Characteristic Ingredients
Traditional ingredients and brewing methods used to create the characteristic profile of ${style.name}.

## Style Comparison
${style.name} can be compared to other styles within the ${style.categoryName} category while maintaining its unique characteristics.

## Vital Statistics
- **OG:** 1.XXX – 1.XXX
- **FG:** 1.XXX – 1.XXX  
- **ABV:** X.X – X.X%
- **IBUs:** XX – XX
- **SRM:** X – X

## Commercial Examples
Various commercial examples represent the ${style.name} style around the world.

## Tags
*${style.categoryName.toLowerCase().replace(/\s+/g, '-')}, traditional-style*
`;

  return { fileName, content };
}

// Main function to create all style files
async function createAllStyleFiles() {
  try {
    console.log('Creating BJCP style files...');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const style of CORE_STYLES) {
      console.log(`Processing: ${style.code} ${style.name}`);
      
      // Check if file already exists
      const expectedFileName = `${style.code.toLowerCase()}-${style.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')}.md`;
      const outputPath = path.join(OUTPUT_DIR, expectedFileName);
      
      if (fs.existsSync(outputPath)) {
        console.log(`File already exists, skipping: ${expectedFileName}`);
        skippedCount++;
        continue;
      }
      
      // Create placeholder style file
      const { fileName, content } = createPlaceholderStyle(style);
      
      // Write file
      fs.writeFileSync(outputPath, content, 'utf8');
      console.log(`Created: ${fileName}`);
      createdCount++;
    }
    
    console.log(`\n=== Style Creation Complete ===`);
    console.log(`Created: ${createdCount} files`);
    console.log(`Skipped (already exist): ${skippedCount} files`);
    console.log(`Total styles processed: ${CORE_STYLES.length}`);
    
  } catch (error) {
    console.error('Error during style creation:', error.message);
    process.exit(1);
  }
}

// Run the creation
createAllStyleFiles(); 