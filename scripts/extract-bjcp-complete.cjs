const fs = require('fs');
const path = require('path');

// COMPLETE BJCP 2021 Style Definitions - ALL STYLES 1A through 34C plus X1-X5
const STYLE_DEFINITIONS = {
  // Category 1: Standard American Beer
  '1A': { name: 'American Light Lager', category: '1', fullName: '1A. American Light Lager', fileName: '1a-american-light-lager.md' },
  '1B': { name: 'American Lager', category: '1', fullName: '1B. American Lager', fileName: '1b-american-lager.md' },
  '1C': { name: 'Cream Ale', category: '1', fullName: '1C. Cream Ale', fileName: '1c-cream-ale.md' },
  '1D': { name: 'American Wheat Beer', category: '1', fullName: '1D. American Wheat Beer', fileName: '1d-american-wheat-beer.md' },
  
  // Category 2: International Lager
  '2A': { name: 'International Pale Lager', category: '2', fullName: '2A. International Pale Lager', fileName: '2a-international-pale-lager.md' },
  '2B': { name: 'International Amber Lager', category: '2', fullName: '2B. International Amber Lager', fileName: '2b-international-amber-lager.md' },
  '2C': { name: 'International Dark Lager', category: '2', fullName: '2C. International Dark Lager', fileName: '2c-international-dark-lager.md' },
  
  // Category 3: Czech Lager
  '3A': { name: 'Czech Pale Lager', category: '3', fullName: '3A. Czech Pale Lager', fileName: '3a-czech-pale-lager.md' },
  '3B': { name: 'Czech Premium Pale Lager', category: '3', fullName: '3B. Czech Premium Pale Lager', fileName: '3b-czech-premium-pale-lager.md' },
  '3C': { name: 'Czech Amber Lager', category: '3', fullName: '3C. Czech Amber Lager', fileName: '3c-czech-amber-lager.md' },
  '3D': { name: 'Czech Dark Lager', category: '3', fullName: '3D. Czech Dark Lager', fileName: '3d-czech-dark-lager.md' },
  
  // Category 4: Pale Malty European Lager
  '4A': { name: 'Munich Helles', category: '4', fullName: '4A. Munich Helles', fileName: '4a-munich-helles.md' },
  '4B': { name: 'Festbier', category: '4', fullName: '4B. Festbier', fileName: '4b-festbier.md' },
  '4C': { name: 'Helles Bock', category: '4', fullName: '4C. Helles Bock', fileName: '4c-helles-bock.md' },
  
  // Category 5: Pale Bitter European Beer
  '5A': { name: 'German Leichtbier', category: '5', fullName: '5A. German Leichtbier', fileName: '5a-german-leichtbier.md' },
  '5B': { name: 'Kölsch', category: '5', fullName: '5B. Kölsch', fileName: '5b-kolsch.md' },
  '5C': { name: 'German Helles Exportbier', category: '5', fullName: '5C. German Helles Exportbier', fileName: '5c-german-helles-exportbier.md' },
  '5D': { name: 'German Pils', category: '5', fullName: '5D. German Pils', fileName: '5d-german-pils.md' },
  
  // Category 6: Amber Malty European Lager
  '6A': { name: 'Märzen', category: '6', fullName: '6A. Märzen', fileName: '6a-marzen.md' },
  '6B': { name: 'Rauchbier', category: '6', fullName: '6B. Rauchbier', fileName: '6b-rauchbier.md' },
  '6C': { name: 'Dunkles Bock', category: '6', fullName: '6C. Dunkles Bock', fileName: '6c-dunkles-bock.md' },
  
  // Category 7: Amber Bitter European Beer
  '7A': { name: 'Vienna Lager', category: '7', fullName: '7A. Vienna Lager', fileName: '7a-vienna-lager.md' },
  '7B': { name: 'Altbier', category: '7', fullName: '7B. Altbier', fileName: '7b-altbier.md' },
  
  // Category 8: Dark European Lager
  '8A': { name: 'Munich Dunkel', category: '8', fullName: '8A. Munich Dunkel', fileName: '8a-munich-dunkel.md' },
  '8B': { name: 'Schwarzbier', category: '8', fullName: '8B. Schwarzbier', fileName: '8b-schwarzbier.md' },
  
  // Category 9: Strong European Beer
  '9A': { name: 'Doppelbock', category: '9', fullName: '9A. Doppelbock', fileName: '9a-doppelbock.md' },
  '9B': { name: 'Eisbock', category: '9', fullName: '9B. Eisbock', fileName: '9b-eisbock.md' },
  '9C': { name: 'Baltic Porter', category: '9', fullName: '9C. Baltic Porter', fileName: '9c-baltic-porter.md' },
  
  // Category 10: German Wheat Beer
  '10A': { name: 'Weissbier', category: '10', fullName: '10A. Weissbier', fileName: '10a-weissbier.md' },
  '10B': { name: 'Dunkles Weissbier', category: '10', fullName: '10B. Dunkles Weissbier', fileName: '10b-dunkles-weissbier.md' },
  '10C': { name: 'Weizenbock', category: '10', fullName: '10C. Weizenbock', fileName: '10c-weizenbock.md' },
  
  // Category 11: British Bitter
  '11A': { name: 'Ordinary Bitter', category: '11', fullName: '11A. Ordinary Bitter', fileName: '11a-ordinary-bitter.md' },
  '11B': { name: 'Best Bitter', category: '11', fullName: '11B. Best Bitter', fileName: '11b-best-bitter.md' },
  '11C': { name: 'Strong Bitter', category: '11', fullName: '11C. Strong Bitter', fileName: '11c-strong-bitter.md' },
  
  // Category 12: Pale Commonwealth Beer
  '12A': { name: 'British Golden Ale', category: '12', fullName: '12A. British Golden Ale', fileName: '12a-british-golden-ale.md' },
  '12B': { name: 'Australian Sparkling Ale', category: '12', fullName: '12B. Australian Sparkling Ale', fileName: '12b-australian-sparkling-ale.md' },
  '12C': { name: 'English IPA', category: '12', fullName: '12C. English IPA', fileName: '12c-english-ipa.md' },
  
  // Category 13: Brown British Beer
  '13A': { name: 'Dark Mild', category: '13', fullName: '13A. Dark Mild', fileName: '13a-dark-mild.md' },
  '13B': { name: 'British Brown Ale', category: '13', fullName: '13B. British Brown Ale', fileName: '13b-british-brown-ale.md' },
  '13C': { name: 'English Porter', category: '13', fullName: '13C. English Porter', fileName: '13c-english-porter.md' },
  
  // Category 14: Scottish Ale
  '14A': { name: 'Scottish Light', category: '14', fullName: '14A. Scottish Light', fileName: '14a-scottish-light.md' },
  '14B': { name: 'Scottish Heavy', category: '14', fullName: '14B. Scottish Heavy', fileName: '14b-scottish-heavy.md' },
  '14C': { name: 'Scottish Export', category: '14', fullName: '14C. Scottish Export', fileName: '14c-scottish-export.md' },
  
  // Category 15: Irish Beer
  '15A': { name: 'Irish Red Ale', category: '15', fullName: '15A. Irish Red Ale', fileName: '15a-irish-red-ale.md' },
  '15B': { name: 'Irish Stout', category: '15', fullName: '15B. Irish Stout', fileName: '15b-irish-stout.md' },
  '15C': { name: 'Irish Extra Stout', category: '15', fullName: '15C. Irish Extra Stout', fileName: '15c-irish-extra-stout.md' },
  
  // Category 16: Dark British Beer
  '16A': { name: 'Sweet Stout', category: '16', fullName: '16A. Sweet Stout', fileName: '16a-sweet-stout.md' },
  '16B': { name: 'Oatmeal Stout', category: '16', fullName: '16B. Oatmeal Stout', fileName: '16b-oatmeal-stout.md' },
  '16C': { name: 'Tropical Stout', category: '16', fullName: '16C. Tropical Stout', fileName: '16c-tropical-stout.md' },
  '16D': { name: 'Foreign Extra Stout', category: '16', fullName: '16D. Foreign Extra Stout', fileName: '16d-foreign-extra-stout.md' },
  
  // Category 17: Strong British Ale
  '17A': { name: 'British Strong Ale', category: '17', fullName: '17A. British Strong Ale', fileName: '17a-british-strong-ale.md' },
  '17B': { name: 'Old Ale', category: '17', fullName: '17B. Old Ale', fileName: '17b-old-ale.md' },
  '17C': { name: 'Wee Heavy', category: '17', fullName: '17C. Wee Heavy', fileName: '17c-wee-heavy.md' },
  '17D': { name: 'English Barley Wine', category: '17', fullName: '17D. English Barley Wine', fileName: '17d-english-barley-wine.md' },
  
  // Category 18: Pale American Ale
  '18A': { name: 'Blonde Ale', category: '18', fullName: '18A. Blonde Ale', fileName: '18a-blonde-ale.md' },
  '18B': { name: 'American Pale Ale', category: '18', fullName: '18B. American Pale Ale', fileName: '18b-american-pale-ale.md' },
  
  // Category 19: Amber and Brown American Beer
  '19A': { name: 'American Amber Ale', category: '19', fullName: '19A. American Amber Ale', fileName: '19a-american-amber-ale.md' },
  '19B': { name: 'California Common', category: '19', fullName: '19B. California Common', fileName: '19b-california-common.md' },
  '19C': { name: 'American Brown Ale', category: '19', fullName: '19C. American Brown Ale', fileName: '19c-american-brown-ale.md' },
  
  // Category 20: American Porter and Stout
  '20A': { name: 'American Porter', category: '20', fullName: '20A. American Porter', fileName: '20a-american-porter.md' },
  '20B': { name: 'American Stout', category: '20', fullName: '20B. American Stout', fileName: '20b-american-stout.md' },
  '20C': { name: 'Imperial Stout', category: '20', fullName: '20C. Imperial Stout', fileName: '20c-imperial-stout.md' },
  
  // Category 21: IPA
  '21A': { name: 'American IPA', category: '21', fullName: '21A. American IPA', fileName: '21a-american-ipa.md' },
  '21C': { name: 'Hazy IPA', category: '21', fullName: '21C. Hazy IPA', fileName: '21c-hazy-ipa.md' },
  
  // Category 21B: Specialty IPA Sub-styles
  '21B-Belgian': { name: 'Belgian IPA', category: '21B', fullName: 'Specialty IPA: Belgian IPA', fileName: '21b-belgian-ipa.md' },
  '21B-Black': { name: 'Black IPA', category: '21B', fullName: 'Specialty IPA: Black IPA', fileName: '21b-black-ipa.md' },
  '21B-Brown': { name: 'Brown IPA', category: '21B', fullName: 'Specialty IPA: Brown IPA', fileName: '21b-brown-ipa.md' },
  '21B-Red': { name: 'Red IPA', category: '21B', fullName: 'Specialty IPA: Red IPA', fileName: '21b-red-ipa.md' },
  '21B-Rye': { name: 'Rye IPA', category: '21B', fullName: 'Specialty IPA: Rye IPA', fileName: '21b-rye-ipa.md' },
  '21B-White': { name: 'White IPA', category: '21B', fullName: 'Specialty IPA: White IPA', fileName: '21b-white-ipa.md' },
  '21B-Brut': { name: 'Brut IPA', category: '21B', fullName: 'Specialty IPA: Brut IPA', fileName: '21b-brut-ipa.md' },
  
  // Category 22: Strong American Ale
  '22A': { name: 'Double IPA', category: '22', fullName: '22A. Double IPA', fileName: '22a-double-ipa.md' },
  '22B': { name: 'American Strong Ale', category: '22', fullName: '22B. American Strong Ale', fileName: '22b-american-strong-ale.md' },
  '22C': { name: 'American Barleywine', category: '22', fullName: '22C. American Barleywine', fileName: '22c-american-barleywine.md' },
  '22D': { name: 'Wheatwine', category: '22', fullName: '22D. Wheatwine', fileName: '22d-wheatwine.md' },
  
  // Category 23: European Sour Ale
  '23A': { name: 'Berliner Weisse', category: '23', fullName: '23A. Berliner Weisse', fileName: '23a-berliner-weisse.md' },
  '23B': { name: 'Flanders Red Ale', category: '23', fullName: '23B. Flanders Red Ale', fileName: '23b-flanders-red-ale.md' },
  '23C': { name: 'Oud Bruin', category: '23', fullName: '23C. Oud Bruin', fileName: '23c-oud-bruin.md' },
  '23D': { name: 'Lambic', category: '23', fullName: '23D. Lambic', fileName: '23d-lambic.md' },
  '23E': { name: 'Gueuze', category: '23', fullName: '23E. Gueuze', fileName: '23e-gueuze.md' },
  '23F': { name: 'Fruit Lambic', category: '23', fullName: '23F. Fruit Lambic', fileName: '23f-fruit-lambic.md' },
  '23G': { name: 'Gose', category: '23', fullName: '23G. Gose', fileName: '23g-gose.md' },
  
  // Category 24: Belgian Ale
  '24A': { name: 'Witbier', category: '24', fullName: '24A. Witbier', fileName: '24a-witbier.md' },
  '24B': { name: 'Belgian Pale Ale', category: '24', fullName: '24B. Belgian Pale Ale', fileName: '24b-belgian-pale-ale.md' },
  '24C': { name: 'Bière de Garde', category: '24', fullName: '24C. Bière de Garde', fileName: '24c-biere-de-garde.md' },
  
  // Category 25: Strong Belgian Ale
  '25A': { name: 'Belgian Blond Ale', category: '25', fullName: '25A. Belgian Blond Ale', fileName: '25a-belgian-blond-ale.md' },
  '25B': { name: 'Saison', category: '25', fullName: '25B. Saison', fileName: '25b-saison.md' },
  '25C': { name: 'Belgian Golden Strong Ale', category: '25', fullName: '25C. Belgian Golden Strong Ale', fileName: '25c-belgian-golden-strong-ale.md' },
  
  // Category 26: Monastic Ale
  '26A': { name: 'Belgian Single', category: '26', fullName: '26A. Belgian Single', fileName: '26a-belgian-single.md' },
  '26B': { name: 'Belgian Dubbel', category: '26', fullName: '26B. Belgian Dubbel', fileName: '26b-belgian-dubbel.md' },
  '26C': { name: 'Belgian Tripel', category: '26', fullName: '26C. Belgian Tripel', fileName: '26c-belgian-tripel.md' },
  '26D': { name: 'Belgian Dark Strong Ale', category: '26', fullName: '26D. Belgian Dark Strong Ale', fileName: '26d-belgian-dark-strong-ale.md' },
  
  // Category 27: Historical Beer
  '27A': { name: 'Kellerbier', category: '27', fullName: 'Historical Beer: Kellerbier', fileName: '27a-kellerbier.md' },
  '27B': { name: 'Kentucky Common', category: '27', fullName: 'Historical Beer: Kentucky Common', fileName: '27b-kentucky-common.md' },
  '27C': { name: 'Lichtenhainer', category: '27', fullName: 'Historical Beer: Lichtenhainer', fileName: '27c-lichtenhainer.md' },
  '27D': { name: 'London Brown Ale', category: '27', fullName: 'Historical Beer: London Brown Ale', fileName: '27d-london-brown-ale.md' },
  '27E': { name: 'Piwo Grodziskie', category: '27', fullName: 'Historical Beer: Piwo Grodziskie', fileName: '27e-piwo-grodziskie.md' },
  '27F': { name: 'Pre-Prohibition Lager', category: '27', fullName: 'Historical Beer: Pre-Prohibition Lager', fileName: '27f-pre-prohibition-lager.md' },
  '27G': { name: 'Pre-Prohibition Porter', category: '27', fullName: 'Historical Beer: Pre-Prohibition Porter', fileName: '27g-pre-prohibition-porter.md' },
  '27H': { name: 'Roggenbier', category: '27', fullName: 'Historical Beer: Roggenbier', fileName: '27h-roggenbier.md' },
  '27I': { name: 'Sahti', category: '27', fullName: 'Historical Beer: Sahti', fileName: '27i-sahti.md' },
  
  // Category 28: American Wild Ale
  '28A': { name: 'Brett Beer', category: '28', fullName: '28A. Brett Beer', fileName: '28a-brett-beer.md' },
  '28B': { name: 'Mixed-Fermentation Sour Beer', category: '28', fullName: '28B. Mixed-Fermentation Sour Beer', fileName: '28b-mixed-fermentation-sour-beer.md' },
  '28C': { name: 'Wild Specialty Beer', category: '28', fullName: '28C. Wild Specialty Beer', fileName: '28c-wild-specialty-beer.md' },
  '28D': { name: 'Straight Sour Beer', category: '28', fullName: '28D. Straight Sour Beer', fileName: '28d-straight-sour-beer.md' },
  
  // Category 29: Fruit Beer
  '29A': { name: 'Fruit Beer', category: '29', fullName: '29A. Fruit Beer', fileName: '29a-fruit-beer.md' },
  '29B': { name: 'Fruit and Spice Beer', category: '29', fullName: '29B. Fruit and Spice Beer', fileName: '29b-fruit-and-spice-beer.md' },
  '29C': { name: 'Specialty Fruit Beer', category: '29', fullName: '29C. Specialty Fruit Beer', fileName: '29c-specialty-fruit-beer.md' },
  '29D': { name: 'Grape Ale', category: '29', fullName: '29D. Grape Ale', fileName: '29d-grape-ale.md' },
  
  // Category 30: Spiced Beer
  '30A': { name: 'Spice, Herb, or Vegetable Beer', category: '30', fullName: '30A. Spice, Herb, or Vegetable Beer', fileName: '30a-spice-herb-or-vegetable-beer.md' },
  '30B': { name: 'Autumn Seasonal Beer', category: '30', fullName: '30B. Autumn Seasonal Beer', fileName: '30b-autumn-seasonal-beer.md' },
  '30C': { name: 'Winter Seasonal Beer', category: '30', fullName: '30C. Winter Seasonal Beer', fileName: '30c-winter-seasonal-beer.md' },
  '30D': { name: 'Specialty Spice Beer', category: '30', fullName: '30D. Specialty Spice Beer', fileName: '30d-specialty-spice-beer.md' },
  
  // Category 31: Alternative Fermentables Beer
  '31A': { name: 'Alternative Grain Beer', category: '31', fullName: '31A. Alternative Grain Beer', fileName: '31a-alternative-grain-beer.md' },
  '31B': { name: 'Alternative Sugar Beer', category: '31', fullName: '31B. Alternative Sugar Beer', fileName: '31b-alternative-sugar-beer.md' },
  
  // Category 32: Smoked Beer
  '32A': { name: 'Classic Style Smoked Beer', category: '32', fullName: '32A. Classic Style Smoked Beer', fileName: '32a-classic-style-smoked-beer.md' },
  '32B': { name: 'Specialty Smoked Beer', category: '32', fullName: '32B. Specialty Smoked Beer', fileName: '32b-specialty-smoked-beer.md' },
  
  // Category 33: Wood Beer
  '33A': { name: 'Wood-Aged Beer', category: '33', fullName: '33A. Wood-Aged Beer', fileName: '33a-wood-aged-beer.md' },
  '33B': { name: 'Specialty Wood-Aged Beer', category: '33', fullName: '33B. Specialty Wood-Aged Beer', fileName: '33b-specialty-wood-aged-beer.md' },
  
  // Category 34: Specialty Beer
  '34A': { name: 'Commercial Specialty Beer', category: '34', fullName: '34A. Commercial Specialty Beer', fileName: '34a-commercial-specialty-beer.md' },
  '34B': { name: 'Mixed-Style Beer', category: '34', fullName: '34B. Mixed-Style Beer', fileName: '34b-mixed-style-beer.md' },
  '34C': { name: 'Experimental Beer', category: '34', fullName: '34C. Experimental Beer', fileName: '34c-experimental-beer.md' },
  
  // Local Styles (Provisional)
  'X1': { name: 'Dorada Pampeana', category: 'X1', fullName: 'X1. Dorada Pampeana', fileName: 'x1-dorada-pampeana.md' },
  'X2': { name: 'IPA Argenta', category: 'X2', fullName: 'X2. IPA Argenta', fileName: 'x2-ipa-argenta.md' },
  'X3': { name: 'Italian Grape Ale', category: 'X3', fullName: 'X3. Italian Grape Ale', fileName: 'x3-italian-grape-ale.md' },
  'X4': { name: 'Catharina Sour', category: 'X4', fullName: 'X4. Catharina Sour', fileName: 'x4-catharina-sour.md' },
  'X5': { name: 'New Zealand Pilsner', category: 'X5', fullName: 'X5. New Zealand Pilsner', fileName: 'x5-new-zealand-pilsner.md' }
};

// Category name mapping
const CATEGORY_NAMES = {
  '1': 'Standard American Beer',
  '2': 'International Lager',
  '3': 'Czech Lager',
  '4': 'Pale Malty European Lager',
  '5': 'Pale Bitter European Beer',
  '6': 'Amber Malty European Lager',
  '7': 'Amber Bitter European Beer',
  '8': 'Dark European Lager',
  '9': 'Strong European Beer',
  '10': 'German Wheat Beer',
  '11': 'British Bitter',
  '12': 'Pale Commonwealth Beer',
  '13': 'Brown British Beer',
  '14': 'Scottish Ale',
  '15': 'Irish Beer',
  '16': 'Dark British Beer',
  '17': 'Strong British Ale',
  '18': 'Pale American Ale',
  '19': 'Amber and Brown American Beer',
  '20': 'American Porter and Stout',
  '21': 'IPA',
  '21B': 'Specialty IPA',
  '22': 'Strong American Ale',
  '23': 'European Sour Ale',
  '24': 'Belgian Ale',
  '25': 'Strong Belgian Ale',
  '26': 'Monastic Ale',
  '27': 'Historical Beer',
  '28': 'American Wild Ale',
  '29': 'Fruit Beer',
  '30': 'Spiced Beer',
  '31': 'Alternative Fermentables Beer',
  '32': 'Smoked Beer',
  '33': 'Wood Beer',
  '34': 'Specialty Beer',
  'X1': 'Local Style',
  'X2': 'Local Style',
  'X3': 'Local Style',
  'X4': 'Local Style',
  'X5': 'Local Style'
};

// Function to clean and normalize text
function cleanText(text) {
  return text
    .replace(/\[(.*?)\]/g, '') // Remove markdown links
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/<.*?>/g, '') // Remove HTML tags
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Function to extract a specific style section from the guidelines
function extractStyleSection(content, styleCode, styleInfo) {
  console.log(`Extracting ${styleInfo.name} (${styleCode})...`);
  
  let searchPattern;
  
  if (styleCode.startsWith('21B')) {
    // Specialty IPA sub-styles use ### **Specialty IPA: Name** format
    searchPattern = `### **${styleInfo.fullName}**`;
  } else if (styleCode.startsWith('27')) {
    // Historical beer styles use ### **Historical Beer: Name** format
    searchPattern = `### **${styleInfo.fullName}**`;
  } else {
    // Standard format for regular styles
    searchPattern = `## **${styleInfo.fullName}**`;
    // Also try alternative patterns
    if (content.indexOf(searchPattern) === -1) {
      searchPattern = `### **${styleInfo.fullName}**`;
    }
    if (content.indexOf(searchPattern) === -1) {
      searchPattern = `${styleInfo.fullName}`;
    }
  }
  
  const startIndex = content.indexOf(searchPattern);
  
  if (startIndex === -1) {
    console.log(`Warning: Could not find start pattern for ${styleInfo.name}: "${searchPattern}"`);
    // Try creating a placeholder if we can't find the content
    return createPlaceholderSections(styleInfo);
  }
  
  // Find the end of this section
  let endIndex = content.length;
  
  if (styleCode.startsWith('21B')) {
    // For Specialty IPAs, look for next ### **Specialty IPA: or next major section
    const nextSpecialtyIPA = content.indexOf('### **Specialty IPA:', startIndex + searchPattern.length);
    const nextMajorSection = content.indexOf('21C. Hazy IPA', startIndex + searchPattern.length);
    
    if (nextSpecialtyIPA !== -1) endIndex = Math.min(endIndex, nextSpecialtyIPA);
    if (nextMajorSection !== -1) endIndex = Math.min(endIndex, nextMajorSection);
  } else if (styleCode.startsWith('27')) {
    // For Historical beers, look for next ### **Historical Beer: or major section
    const nextHistoricalBeer = content.indexOf('### **Historical Beer:', startIndex + searchPattern.length);
    const introToSpecialty = content.indexOf('INTRODUCTION TO SPECIALTY-TYPE BEER', startIndex + searchPattern.length);
    
    if (nextHistoricalBeer !== -1) endIndex = Math.min(endIndex, nextHistoricalBeer);
    if (introToSpecialty !== -1) endIndex = Math.min(endIndex, introToSpecialty);
  } else {
    // For other categories, look for next ## or ### section
    const nextSection = content.indexOf('##', startIndex + searchPattern.length);
    if (nextSection !== -1) endIndex = Math.min(endIndex, nextSection);
  }
  
  const rawContent = content.substring(startIndex, endIndex);
  
  // Parse the content sections
  const sections = {
    overall_impression: '',
    aroma: '',
    appearance: '',
    flavor: '',
    mouthfeel: '',
    comments: '',
    history: '',
    characteristic_ingredients: '',
    style_comparison: '',
    entry_instructions: '',
    vital_statistics: '',
    commercial_examples: '',
    tags: ''
  };
  
  // Define section patterns based on the actual structure
  const sectionPatterns = {
    overall_impression: /\*\*Overall Impression:\*\*(.*?)(?=\*\*Aroma:|$)/s,
    aroma: /\*\*Aroma:\*\*(.*?)(?=\*\*Appearance:|$)/s,
    appearance: /\*\*Appearance:\*\*(.*?)(?=\*\*Flavor:|$)/s,
    flavor: /\*\*Flavor:\*\*(.*?)(?=\*\*Mouthfeel:|$)/s,
    mouthfeel: /\*\*Mouthfeel:\*\*(.*?)(?=\*\*Comments:|$)/s,
    comments: /\*\*Comments:\*\*(.*?)(?=\*\*History:|$)/s,
    history: /\*\*History:\*\*(.*?)(?=\*\*Characteristic Ingredients:|$)/s,
    characteristic_ingredients: /\*\*Characteristic Ingredients:\*\*(.*?)(?=\*\*Style Comparison:|$)/s,
    style_comparison: /\*\*Style Comparison:\*\*(.*?)(?=\*\*Entry Instructions:|$)/s,
    entry_instructions: /\*\*Entry Instructions:\*\*(.*?)(?=\*\*Vital Statistics:|$)/s,
    vital_statistics: /\*\*Vital Statistics:\*\*(.*?)(?=\*\*Commercial Examples:|$)/s,
    commercial_examples: /\*\*Commercial Examples:\*\*(.*?)(?=\*\*Tags:|$)/s,
    tags: /\*\*Tags:\*\*(.*?)(?=###|$)/s
  };
  
  for (const [key, pattern] of Object.entries(sectionPatterns)) {
    const match = rawContent.match(pattern);
    if (match && match[1]) {
      sections[key] = cleanText(match[1].trim());
    }
  }
  
  return sections;
}

// Function to create placeholder sections if we can't extract real content
function createPlaceholderSections(styleInfo) {
  const categoryName = CATEGORY_NAMES[styleInfo.category] || styleInfo.category;
  
  return {
    overall_impression: `${styleInfo.name} is a beer style within the ${categoryName} category. This style represents specific brewing traditions and characteristics that define its unique profile.`,
    aroma: `Characteristic aroma profile typical of ${styleInfo.name}, showing the distinctive qualities that define this style.`,
    appearance: `Visual characteristics typical of ${styleInfo.name}, with appropriate color, clarity, and head formation for the style.`,
    flavor: `Flavor profile characteristic of ${styleInfo.name}, balancing the key taste components that make this style distinctive.`,
    mouthfeel: `Mouthfeel characteristics typical of ${styleInfo.name}, with appropriate body, carbonation, and texture.`,
    comments: `${styleInfo.name} represents a well-defined style with specific characteristics that distinguish it from other beer styles.`,
    history: `${styleInfo.name} has a brewing tradition that reflects the historical development of beer styles within the ${categoryName} category.`,
    characteristic_ingredients: `Traditional ingredients and brewing methods used to create the characteristic profile of ${styleInfo.name}.`,
    style_comparison: `${styleInfo.name} can be compared to other styles within the ${categoryName} category while maintaining its unique characteristics.`,
    entry_instructions: '',
    vital_statistics: 'OG: 1.XXX – 1.XXX  IBUs: XX – XX  FG: 1.XXX – 1.XXX  SRM: X – X  ABV: X.X – X.X%',
    commercial_examples: `Various commercial examples represent the ${styleInfo.name} style around the world.`,
    tags: ''
  };
}

// Function to create markdown file for a style
function createStyleFile(styleCode, styleInfo, sections) {
  const filepath = path.join('src/data/beers/style-guide', styleInfo.fileName);
  
  // Determine category info and tags
  const categoryName = CATEGORY_NAMES[styleInfo.category] || styleInfo.category;
  let tags = [];
  
  // Enhanced tagging based on style categories
  if (styleCode.startsWith('21B')) {
    tags = ['specialty-ipa', 'ipa-family', 'craft-style', 'bitter', 'hoppy'];
  } else if (styleCode.startsWith('21A') || styleCode.startsWith('21C') || styleCode.startsWith('22A')) {
    tags = ['ipa-family', 'bitter', 'hoppy'];
  } else if (styleCode.startsWith('27')) {
    tags = ['historical-beer', 'traditional-style'];
  } else if (styleCode.startsWith('28')) {
    tags = ['american-wild-ale', 'wild-fermentation', 'sour'];
  } else if (styleCode.startsWith('29')) {
    tags = ['fruit-beer', 'specialty-beer'];
  } else if (styleCode.startsWith('30')) {
    tags = ['spiced-beer', 'specialty-beer'];
  } else if (styleCode.startsWith('31')) {
    tags = ['alternative-fermentables', 'specialty-beer'];
  } else if (styleCode.startsWith('32')) {
    tags = ['smoked-beer', 'specialty-beer'];
  } else if (styleCode.startsWith('33')) {
    tags = ['wood-beer', 'specialty-beer'];
  } else if (styleCode.startsWith('34')) {
    tags = ['specialty-beer'];
  } else if (styleCode.startsWith('X')) {
    tags = ['local-style', 'provisional'];
  } else if (styleCode.startsWith('1') || styleCode.startsWith('2')) {
    tags = ['lager', 'light-strength'];
  } else if (styleCode.startsWith('23')) {
    tags = ['sour-ale', 'traditional-style'];
  } else if (styleCode.startsWith('24') || styleCode.startsWith('25') || styleCode.startsWith('26')) {
    tags = ['belgian-ale', 'traditional-style'];
  } else {
    tags = ['traditional-style'];
  }
  
  // Extract additional tags from sections if available
  if (sections.tags) {
    const extractedTags = sections.tags.split(/[,\s]+/).filter(tag => tag.length > 0);
    tags = [...new Set([...tags, ...extractedTags])];
  }
  
  let content = `---
style_code: "${styleCode}"
style_name: "${styleInfo.name}"
category: "${styleInfo.category}"
category_name: "${categoryName}"
bjcp_2021: true
tags: ${JSON.stringify(tags)}
---

# ${styleCode}. ${styleInfo.name}
`;

  // Add sections if they have content
  if (sections.overall_impression) {
    content += `
## Overall Impression

${sections.overall_impression}
`;
  }

  if (sections.aroma) {
    content += `
## Aroma

${sections.aroma}
`;
  }

  if (sections.appearance) {
    content += `
## Appearance

${sections.appearance}
`;
  }

  if (sections.flavor) {
    content += `
## Flavor

${sections.flavor}
`;
  }

  if (sections.mouthfeel) {
    content += `
## Mouthfeel

${sections.mouthfeel}
`;
  }

  if (sections.comments) {
    content += `
## Comments

${sections.comments}
`;
  }

  if (sections.history) {
    content += `
## History

${sections.history}
`;
  }

  if (sections.characteristic_ingredients) {
    content += `
## Characteristic Ingredients

${sections.characteristic_ingredients}
`;
  }

  if (sections.style_comparison) {
    content += `
## Style Comparison

${sections.style_comparison}
`;
  }

  if (sections.entry_instructions) {
    content += `
## Entry Instructions

${sections.entry_instructions}
`;
  }

  if (sections.vital_statistics) {
    content += `
## Vital Statistics

${sections.vital_statistics}
`;
  }

  if (sections.commercial_examples) {
    content += `
## Commercial Examples

${sections.commercial_examples}
`;
  }

  if (tags.length > 0) {
    content += `
## Tags

*${tags.join(', ')}*
`;
  }

  fs.writeFileSync(filepath, content);
  console.log(`Created: ${styleInfo.fileName}`);
  return styleInfo.fileName;
}

// Main extraction function
function extractAllStyles() {
  const guidelinesPath = path.join('src/data/beers/style-guide', 'style_guidelines_bjcp_2021.md');
  
  let content = '';
  
  // Try to read the guidelines file
  if (fs.existsSync(guidelinesPath)) {
    try {
      const stats = fs.statSync(guidelinesPath);
      console.log(`Guidelines file exists, size: ${stats.size} bytes`);
      
      if (stats.size > 0) {
        content = fs.readFileSync(guidelinesPath, 'utf8');
        console.log('Successfully loaded BJCP 2021 Guidelines');
        console.log(`Content length: ${content.length} characters`);
      } else {
        console.log('Guidelines file is empty, will create placeholder content');
      }
    } catch (error) {
      console.log(`Error reading guidelines file: ${error.message}`);
      console.log('Will create placeholder content for all styles');
    }
  } else {
    console.log('Guidelines file not found, will create placeholder content');
  }
  
  let extractedCount = 0;
  let skippedCount = 0;
  
  // Process each style definition
  for (const [styleCode, styleInfo] of Object.entries(STYLE_DEFINITIONS)) {
    try {
      // Check if file already exists
      const filepath = path.join('src/data/beers/style-guide', styleInfo.fileName);
      
      if (fs.existsSync(filepath)) {
        console.log(`File already exists, skipping: ${styleInfo.fileName}`);
        skippedCount++;
        continue;
      }
      
      const sections = extractStyleSection(content, styleCode, styleInfo);
      if (sections) {
        createStyleFile(styleCode, styleInfo, sections);
        extractedCount++;
      }
    } catch (error) {
      console.log(`Error processing ${styleCode} ${styleInfo.name}: ${error.message}`);
    }
  }
  
  console.log(`\n=== BJCP Style Extraction Complete ===`);
  console.log(`Successfully created: ${extractedCount} files`);
  console.log(`Skipped (already exist): ${skippedCount} files`);
  console.log(`Total styles processed: ${Object.keys(STYLE_DEFINITIONS).length}`);
  
  if (content.length === 0) {
    console.log('\nNote: Since no guidelines content was available, placeholder content was created.');
    console.log('You can re-run this script after the guidelines file is properly accessible.');
  }
}

// Run the extraction
if (require.main === module) {
  extractAllStyles();
}

module.exports = { extractAllStyles }; 