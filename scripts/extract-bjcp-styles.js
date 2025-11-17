// BJCP 2021 Beer Styles Extraction Script
// This script defines all beer styles from the BJCP 2021 guidelines

const BJCP_STYLES = [
  // Category 1: Standard American Beer
  { code: '1A', name: 'American Light Lager', category: '1', categoryName: 'Standard American Beer' },
  { code: '1B', name: 'American Lager', category: '1', categoryName: 'Standard American Beer' },
  { code: '1C', name: 'Cream Ale', category: '1', categoryName: 'Standard American Beer' },
  { code: '1D', name: 'American Wheat Beer', category: '1', categoryName: 'Standard American Beer' },

  // Category 2: International Lager
  { code: '2A', name: 'International Pale Lager', category: '2', categoryName: 'International Lager' },
  { code: '2B', name: 'International Amber Lager', category: '2', categoryName: 'International Lager' },
  { code: '2C', name: 'International Dark Lager', category: '2', categoryName: 'International Lager' },

  // Category 3: Czech Lager
  { code: '3A', name: 'Czech Pale Lager', category: '3', categoryName: 'Czech Lager' },
  { code: '3B', name: 'Czech Premium Pale Lager', category: '3', categoryName: 'Czech Lager' },
  { code: '3C', name: 'Czech Amber Lager', category: '3', categoryName: 'Czech Lager' },
  { code: '3D', name: 'Czech Dark Lager', category: '3', categoryName: 'Czech Lager' },

  // Category 4: Pale Malty European Lager
  { code: '4A', name: 'Munich Helles', category: '4', categoryName: 'Pale Malty European Lager' },
  { code: '4B', name: 'Festbier', category: '4', categoryName: 'Pale Malty European Lager' },
  { code: '4C', name: 'Helles Bock', category: '4', categoryName: 'Pale Malty European Lager' },

  // Category 5: Pale Bitter European Beer
  { code: '5A', name: 'German Leichtbier', category: '5', categoryName: 'Pale Bitter European Beer' },
  { code: '5B', name: 'Kölsch', category: '5', categoryName: 'Pale Bitter European Beer' },
  { code: '5C', name: 'German Helles Exportbier', category: '5', categoryName: 'Pale Bitter European Beer' },
  { code: '5D', name: 'German Pils', category: '5', categoryName: 'Pale Bitter European Beer' },

  // Category 6: Amber Malty European Lager
  { code: '6A', name: 'Märzen', category: '6', categoryName: 'Amber Malty European Lager' },
  { code: '6B', name: 'Rauchbier', category: '6', categoryName: 'Amber Malty European Lager' },
  { code: '6C', name: 'Dunkles Bock', category: '6', categoryName: 'Amber Malty European Lager' },

  // Category 7: Amber Bitter European Beer
  { code: '7A', name: 'Vienna Lager', category: '7', categoryName: 'Amber Bitter European Beer' },
  { code: '7B', name: 'Altbier', category: '7', categoryName: 'Amber Bitter European Beer' },

  // Category 8: Dark European Lager
  { code: '8A', name: 'Munich Dunkel', category: '8', categoryName: 'Dark European Lager' },
  { code: '8B', name: 'Schwarzbier', category: '8', categoryName: 'Dark European Lager' },

  // Category 9: Strong European Beer
  { code: '9A', name: 'Doppelbock', category: '9', categoryName: 'Strong European Beer' },
  { code: '9B', name: 'Eisbock', category: '9', categoryName: 'Strong European Beer' },
  { code: '9C', name: 'Baltic Porter', category: '9', categoryName: 'Strong European Beer' },

  // Category 10: German Wheat Beer
  { code: '10A', name: 'Weissbier', category: '10', categoryName: 'German Wheat Beer' },
  { code: '10B', name: 'Dunkles Weissbier', category: '10', categoryName: 'German Wheat Beer' },
  { code: '10C', name: 'Weizenbock', category: '10', categoryName: 'German Wheat Beer' },

  // Category 11: British Bitter
  { code: '11A', name: 'Ordinary Bitter', category: '11', categoryName: 'British Bitter' },
  { code: '11B', name: 'Best Bitter', category: '11', categoryName: 'British Bitter' },
  { code: '11C', name: 'Strong Bitter', category: '11', categoryName: 'British Bitter' },

  // Category 12: Pale Commonwealth Beer
  { code: '12A', name: 'British Golden Ale', category: '12', categoryName: 'Pale Commonwealth Beer' },
  { code: '12B', name: 'Australian Sparkling Ale', category: '12', categoryName: 'Pale Commonwealth Beer' },
  { code: '12C', name: 'English IPA', category: '12', categoryName: 'Pale Commonwealth Beer' },

  // Category 13: Brown British Beer
  { code: '13A', name: 'Dark Mild', category: '13', categoryName: 'Brown British Beer' },
  { code: '13B', name: 'British Brown Ale', category: '13', categoryName: 'Brown British Beer' },
  { code: '13C', name: 'English Porter', category: '13', categoryName: 'Brown British Beer' },

  // Category 14: Scottish Ale
  { code: '14A', name: 'Scottish Light', category: '14', categoryName: 'Scottish Ale' },
  { code: '14B', name: 'Scottish Heavy', category: '14', categoryName: 'Scottish Ale' },
  { code: '14C', name: 'Scottish Export', category: '14', categoryName: 'Scottish Ale' },

  // Category 15: Irish Beer
  { code: '15A', name: 'Irish Red Ale', category: '15', categoryName: 'Irish Beer' },
  { code: '15B', name: 'Irish Stout', category: '15', categoryName: 'Irish Beer' },
  { code: '15C', name: 'Irish Extra Stout', category: '15', categoryName: 'Irish Beer' },

  // Category 16: Dark British Beer
  { code: '16A', name: 'Sweet Stout', category: '16', categoryName: 'Dark British Beer' },
  { code: '16B', name: 'Oatmeal Stout', category: '16', categoryName: 'Dark British Beer' },
  { code: '16C', name: 'Tropical Stout', category: '16', categoryName: 'Dark British Beer' },
  { code: '16D', name: 'Foreign Extra Stout', category: '16', categoryName: 'Dark British Beer' },

  // Category 17: Strong British Ale
  { code: '17A', name: 'British Strong Ale', category: '17', categoryName: 'Strong British Ale' },
  { code: '17B', name: 'Old Ale', category: '17', categoryName: 'Strong British Ale' },
  { code: '17C', name: 'Wee Heavy', category: '17', categoryName: 'Strong British Ale' },
  { code: '17D', name: 'English Barley Wine', category: '17', categoryName: 'Strong British Ale' },

  // Category 18: Pale American Ale
  { code: '18A', name: 'Blonde Ale', category: '18', categoryName: 'Pale American Ale' },
  { code: '18B', name: 'American Pale Ale', category: '18', categoryName: 'Pale American Ale' },

  // Category 19: Amber and Brown American Beer
  { code: '19A', name: 'American Amber Ale', category: '19', categoryName: 'Amber and Brown American Beer' },
  { code: '19B', name: 'California Common', category: '19', categoryName: 'Amber and Brown American Beer' },
  { code: '19C', name: 'American Brown Ale', category: '19', categoryName: 'Amber and Brown American Beer' },

  // Category 20: American Porter and Stout
  { code: '20A', name: 'American Porter', category: '20', categoryName: 'American Porter and Stout' },
  { code: '20B', name: 'American Stout', category: '20', categoryName: 'American Porter and Stout' },
  { code: '20C', name: 'Imperial Stout', category: '20', categoryName: 'American Porter and Stout' },

  // Category 21: IPA
  { code: '21A', name: 'American IPA', category: '21', categoryName: 'IPA' },
  { code: '21B', name: 'Specialty IPA', category: '21', categoryName: 'IPA' },
  { code: '21C', name: 'Hazy IPA', category: '21', categoryName: 'IPA' },

  // Category 22: Strong American Ale
  { code: '22A', name: 'Double IPA', category: '22', categoryName: 'Strong American Ale' },
  { code: '22B', name: 'American Strong Ale', category: '22', categoryName: 'Strong American Ale' },
  { code: '22C', name: 'American Barleywine', category: '22', categoryName: 'Strong American Ale' },
  { code: '22D', name: 'Wheatwine', category: '22', categoryName: 'Strong American Ale' },

  // Category 23: European Sour Ale
  { code: '23A', name: 'Berliner Weisse', category: '23', categoryName: 'European Sour Ale' },
  { code: '23B', name: 'Flanders Red Ale', category: '23', categoryName: 'European Sour Ale' },
  { code: '23C', name: 'Oud Bruin', category: '23', categoryName: 'European Sour Ale' },
  { code: '23D', name: 'Lambic', category: '23', categoryName: 'European Sour Ale' },
  { code: '23E', name: 'Gueuze', category: '23', categoryName: 'European Sour Ale' },
  { code: '23F', name: 'Fruit Lambic', category: '23', categoryName: 'European Sour Ale' },
  { code: '23G', name: 'Gose', category: '23', categoryName: 'European Sour Ale' },

  // Category 24: Belgian Ale
  { code: '24A', name: 'Witbier', category: '24', categoryName: 'Belgian Ale' },
  { code: '24B', name: 'Belgian Pale Ale', category: '24', categoryName: 'Belgian Ale' },
  { code: '24C', name: 'Bière de Garde', category: '24', categoryName: 'Belgian Ale' },

  // Category 25: Strong Belgian Ale
  { code: '25A', name: 'Belgian Blond Ale', category: '25', categoryName: 'Strong Belgian Ale' },
  { code: '25B', name: 'Saison', category: '25', categoryName: 'Strong Belgian Ale' },
  { code: '25C', name: 'Belgian Golden Strong Ale', category: '25', categoryName: 'Strong Belgian Ale' },

  // Category 26: Monastic Ale
  { code: '26A', name: 'Belgian Single', category: '26', categoryName: 'Monastic Ale' },
  { code: '26B', name: 'Belgian Dubbel', category: '26', categoryName: 'Monastic Ale' },
  { code: '26C', name: 'Belgian Tripel', category: '26', categoryName: 'Monastic Ale' },
  { code: '26D', name: 'Belgian Dark Strong Ale', category: '26', categoryName: 'Monastic Ale' },

  // Category 27: Historical Beer (these have special naming)
  { code: '27', name: 'Kellerbier', category: '27', categoryName: 'Historical Beer' },
  { code: '27', name: 'Kentucky Common', category: '27', categoryName: 'Historical Beer' },
  { code: '27', name: 'Lichtenhainer', category: '27', categoryName: 'Historical Beer' },
  { code: '27', name: 'London Brown Ale', category: '27', categoryName: 'Historical Beer' },
  { code: '27', name: 'Piwo Grodziskie', category: '27', categoryName: 'Historical Beer' },
  { code: '27', name: 'Pre-Prohibition Lager', category: '27', categoryName: 'Historical Beer' },
  { code: '27', name: 'Pre-Prohibition Porter', category: '27', categoryName: 'Historical Beer' },
  { code: '27', name: 'Roggenbier', category: '27', categoryName: 'Historical Beer' },
  { code: '27', name: 'Sahti', category: '27', categoryName: 'Historical Beer' },

  // Specialty IPA sub-styles
  { code: '21B', name: 'Belgian IPA', category: '21', categoryName: 'IPA', isSpecialty: true },
  { code: '21B', name: 'Black IPA', category: '21', categoryName: 'IPA', isSpecialty: true },
  { code: '21B', name: 'Brown IPA', category: '21', categoryName: 'IPA', isSpecialty: true },
  { code: '21B', name: 'Red IPA', category: '21', categoryName: 'IPA', isSpecialty: true },
  { code: '21B', name: 'Rye IPA', category: '21', categoryName: 'IPA', isSpecialty: true },
  { code: '21B', name: 'White IPA', category: '21', categoryName: 'IPA', isSpecialty: true },
  { code: '21B', name: 'Brut IPA', category: '21', categoryName: 'IPA', isSpecialty: true },

  // Category 28: American Wild Ale
  { code: '28A', name: 'Brett Beer', category: '28', categoryName: 'American Wild Ale' },
  { code: '28B', name: 'Mixed-Fermentation Sour Beer', category: '28', categoryName: 'American Wild Ale' },
  { code: '28C', name: 'Wild Specialty Beer', category: '28', categoryName: 'American Wild Ale' },
  { code: '28D', name: 'Straight Sour Beer', category: '28', categoryName: 'American Wild Ale' },

  // Category 29: Fruit Beer
  { code: '29A', name: 'Fruit Beer', category: '29', categoryName: 'Fruit Beer' },
  { code: '29B', name: 'Fruit and Spice Beer', category: '29', categoryName: 'Fruit Beer' },
  { code: '29C', name: 'Specialty Fruit Beer', category: '29', categoryName: 'Fruit Beer' },
  { code: '29D', name: 'Grape Ale', category: '29', categoryName: 'Fruit Beer' },

  // Category 30: Spiced Beer
  { code: '30A', name: 'Spice, Herb, or Vegetable Beer', category: '30', categoryName: 'Spiced Beer' },
  { code: '30B', name: 'Autumn Seasonal Beer', category: '30', categoryName: 'Spiced Beer' },
  { code: '30C', name: 'Winter Seasonal Beer', category: '30', categoryName: 'Spiced Beer' },
  { code: '30D', name: 'Specialty Spice Beer', category: '30', categoryName: 'Spiced Beer' },

  // Category 31: Alternative Fermentables Beer
  { code: '31A', name: 'Alternative Grain Beer', category: '31', categoryName: 'Alternative Fermentables Beer' },
  { code: '31B', name: 'Alternative Sugar Beer', category: '31', categoryName: 'Alternative Fermentables Beer' },

  // Category 32: Smoked Beer
  { code: '32A', name: 'Classic Style Smoked Beer', category: '32', categoryName: 'Smoked Beer' },
  { code: '32B', name: 'Specialty Smoked Beer', category: '32', categoryName: 'Smoked Beer' },

  // Category 33: Wood Beer
  { code: '33A', name: 'Wood-Aged Beer', category: '33', categoryName: 'Wood Beer' },
  { code: '33B', name: 'Specialty Wood-Aged Beer', category: '33', categoryName: 'Wood Beer' },

  // Category 34: Specialty Beer
  { code: '34A', name: 'Commercial Specialty Beer', category: '34', categoryName: 'Specialty Beer' },
  { code: '34B', name: 'Mixed-Style Beer', category: '34', categoryName: 'Specialty Beer' },
  { code: '34C', name: 'Experimental Beer', category: '34', categoryName: 'Specialty Beer' },

  // Appendix B: Local Styles
  { code: 'X1', name: 'Dorada Pampeana', category: 'X', categoryName: 'Local Styles' },
  { code: 'X2', name: 'IPA Argenta', category: 'X', categoryName: 'Local Styles' },
  { code: 'X3', name: 'Italian Grape Ale', category: 'X', categoryName: 'Local Styles' },
  { code: 'X4', name: 'Catharina Sour', category: 'X', categoryName: 'Local Styles' },
  { code: 'X5', name: 'New Zealand Pilsner', category: 'X', categoryName: 'Local Styles' },
];

// Generate file name mapping
function generateStyleFileMapping() {
  const mapping = {};
  
  BJCP_STYLES.forEach(style => {
    const fileName = `${style.code.toLowerCase()}-${style.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')}.md`;
    
    mapping[style.name] = fileName;
    
    // Add common alternate names
    switch(style.name) {
      case 'Czech Premium Pale Lager':
        mapping['Czech Pilsner'] = fileName;
        mapping['Pilsner Urquell Style'] = fileName;
        break;
      case 'Weissbier':
        mapping['German Hefeweizen'] = fileName;
        mapping['Hefeweizen'] = fileName;
        mapping['Weizen'] = fileName;
        break;
      case 'Hazy IPA':
        mapping['New England IPA'] = fileName;
        mapping['NEIPA'] = fileName;
        mapping['Juicy IPA'] = fileName;
        break;
      case 'Imperial Stout':
        mapping['Russian Imperial Stout'] = fileName;
        mapping['RIS'] = fileName;
        mapping['Barrel Aged Imperial Stout'] = fileName;
        break;
      case 'American IPA':
        mapping['West Coast IPA'] = fileName;
        break;
      case 'British Brown Ale':
        mapping['English Brown Ale'] = fileName;
        break;
      case 'Berliner Weisse':
        mapping['Fruited Sour Ale'] = fileName; // Fallback
        break;
      case 'Flanders Red Ale':
        mapping['Barrel Aged Sour Ale'] = fileName; // Fallback
        break;
    }
  });
  
  return mapping;
}

// Generate TypeScript mapping for styleLoader.ts
function generateTypeScriptMapping() {
  const mapping = generateStyleFileMapping();
  
  let output = `// Style name to file mapping - Generated from BJCP 2021 Guidelines\n`;
  output += `const STYLE_FILE_MAP: Record<string, string> = {\n`;
  
  for (const [styleName, fileName] of Object.entries(mapping)) {
    output += `  '${styleName}': '${fileName}',\n`;
  }
  
  output += `  // Add more mappings as needed\n`;
  output += `};\n`;
  
  return output;
}

// Output the mapping
console.log('=== BJCP 2021 Style File Mapping ===');
console.log(generateTypeScriptMapping());

console.log('\n=== Style Count ===');
console.log(`Total Styles: ${BJCP_STYLES.length}`);

console.log('\n=== Categories ===');
const categories = [...new Set(BJCP_STYLES.map(s => `${s.category}. ${s.categoryName}`))];
categories.forEach(cat => console.log(cat));

export {
  BJCP_STYLES,
  generateStyleFileMapping,
  generateTypeScriptMapping
}; 