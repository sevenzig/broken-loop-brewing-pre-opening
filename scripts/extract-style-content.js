import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the BJCP guidelines
const guidelinesPath = path.join(__dirname, '../src/data/beers/style-guide/style_guidelines_bjcp_2021.md');
const outputDir = path.join(__dirname, '../src/data/beers/style-guide');

if (!fs.existsSync(guidelinesPath)) {
  console.error('BJCP guidelines file not found!');
  process.exit(1);
}

const content = fs.readFileSync(guidelinesPath, 'utf-8');
const lines = content.split('\n');

// Complete BJCP 2021 Style patterns for extraction
const STYLE_PATTERNS = [
  // Category 1: Standard American Beer
  { code: '1A', name: 'American Light Lager', startPattern: /^# 1A\.\s+American Light Lager/i },
  { code: '1B', name: 'American Lager', startPattern: /^# 1B\.\s+American Lager/i },
  { code: '1C', name: 'Cream Ale', startPattern: /^# 1C\.\s+Cream Ale/i },
  { code: '1D', name: 'American Wheat Beer', startPattern: /^# 1D\.\s+American Wheat Beer/i },

  // Category 2: International Lager
  { code: '2A', name: 'International Pale Lager', startPattern: /^# 2A\.\s+International Pale Lager/i },
  { code: '2B', name: 'International Amber Lager', startPattern: /^# 2B\.\s+International Amber Lager/i },
  { code: '2C', name: 'International Dark Lager', startPattern: /^# 2C\.\s+International Dark Lager/i },

  // Category 3: Czech Lager
  { code: '3A', name: 'Czech Pale Lager', startPattern: /^# 3A\.\s+Czech Pale Lager/i },
  { code: '3B', name: 'Czech Premium Pale Lager', startPattern: /^# 3B\.\s+Czech Premium Pale Lager/i },
  { code: '3C', name: 'Czech Amber Lager', startPattern: /^# 3C\.\s+Czech Amber Lager/i },
  { code: '3D', name: 'Czech Dark Lager', startPattern: /^# 3D\.\s+Czech Dark Lager/i },

  // Category 4: Pale Malty European Lager
  { code: '4A', name: 'Munich Helles', startPattern: /^# 4A\.\s+Munich Helles/i },
  { code: '4B', name: 'Festbier', startPattern: /^# 4B\.\s+Festbier/i },
  { code: '4C', name: 'Helles Bock', startPattern: /^# 4C\.\s+Helles Bock/i },

  // Category 5: Pale Bitter European Beer
  { code: '5A', name: 'German Leichtbier', startPattern: /^# 5A\.\s+German Leichtbier/i },
  { code: '5B', name: 'Kölsch', startPattern: /^# 5B\.\s+Kölsch/i },
  { code: '5C', name: 'German Helles Exportbier', startPattern: /^# 5C\.\s+German Helles Exportbier/i },
  { code: '5D', name: 'German Pils', startPattern: /^# 5D\.\s+German Pils/i },

  // Category 6: Amber Malty European Lager
  { code: '6A', name: 'Märzen', startPattern: /^# 6A\.\s+Märzen/i },
  { code: '6B', name: 'Rauchbier', startPattern: /^# 6B\.\s+Rauchbier/i },
  { code: '6C', name: 'Dunkles Bock', startPattern: /^# 6C\.\s+Dunkles Bock/i },

  // Category 7: Amber Bitter European Beer
  { code: '7A', name: 'Vienna Lager', startPattern: /^# 7A\.\s+Vienna Lager/i },
  { code: '7B', name: 'Altbier', startPattern: /^# 7B\.\s+Altbier/i },

  // Category 8: Dark European Lager
  { code: '8A', name: 'Munich Dunkel', startPattern: /^# 8A\.\s+Munich Dunkel/i },
  { code: '8B', name: 'Schwarzbier', startPattern: /^# 8B\.\s+Schwarzbier/i },

  // Category 9: Strong European Beer
  { code: '9A', name: 'Doppelbock', startPattern: /^# 9A\.\s+Doppelbock/i },
  { code: '9B', name: 'Eisbock', startPattern: /^# 9B\.\s+Eisbock/i },
  { code: '9C', name: 'Baltic Porter', startPattern: /^# 9C\.\s+Baltic Porter/i },

  // Category 10: German Wheat Beer
  { code: '10A', name: 'Weissbier', startPattern: /^# 10A\.\s+Weissbier/i },
  { code: '10B', name: 'Dunkles Weissbier', startPattern: /^# 10B\.\s+Dunkles Weissbier/i },
  { code: '10C', name: 'Weizenbock', startPattern: /^# 10C\.\s+Weizenbock/i },

  // Category 11: British Bitter
  { code: '11A', name: 'Ordinary Bitter', startPattern: /^# 11A\.\s+Ordinary Bitter/i },
  { code: '11B', name: 'Best Bitter', startPattern: /^# 11B\.\s+Best Bitter/i },
  { code: '11C', name: 'Strong Bitter', startPattern: /^# 11C\.\s+Strong Bitter/i },

  // Category 12: Pale Commonwealth Beer
  { code: '12A', name: 'British Golden Ale', startPattern: /^# 12A\.\s+British Golden Ale/i },
  { code: '12B', name: 'Australian Sparkling Ale', startPattern: /^# 12B\.\s+Australian Sparkling Ale/i },
  { code: '12C', name: 'English IPA', startPattern: /^# 12C\.\s+English IPA/i },

  // Category 13: Brown British Beer
  { code: '13A', name: 'Dark Mild', startPattern: /^# 13A\.\s+Dark Mild/i },
  { code: '13B', name: 'British Brown Ale', startPattern: /^# 13B\.\s+British Brown Ale/i },
  { code: '13C', name: 'English Porter', startPattern: /^# 13C\.\s+English Porter/i },

  // Category 14: Scottish Ale
  { code: '14A', name: 'Scottish Light', startPattern: /^# 14A\.\s+Scottish Light/i },
  { code: '14B', name: 'Scottish Heavy', startPattern: /^# 14B\.\s+Scottish Heavy/i },
  { code: '14C', name: 'Scottish Export', startPattern: /^# 14C\.\s+Scottish Export/i },

  // Category 15: Irish Beer
  { code: '15A', name: 'Irish Red Ale', startPattern: /^# 15A\.\s+Irish Red Ale/i },
  { code: '15B', name: 'Irish Stout', startPattern: /^# 15B\.\s+Irish Stout/i },
  { code: '15C', name: 'Irish Extra Stout', startPattern: /^# 15C\.\s+Irish Extra Stout/i },

  // Category 16: Dark British Beer
  { code: '16A', name: 'Sweet Stout', startPattern: /^# 16A\.\s+Sweet Stout/i },
  { code: '16B', name: 'Oatmeal Stout', startPattern: /^# 16B\.\s+Oatmeal Stout/i },
  { code: '16C', name: 'Tropical Stout', startPattern: /^# 16C\.\s+Tropical Stout/i },
  { code: '16D', name: 'Foreign Extra Stout', startPattern: /^# 16D\.\s+Foreign Extra Stout/i },

  // Category 17: Strong British Ale
  { code: '17A', name: 'British Strong Ale', startPattern: /^# 17A\.\s+British Strong Ale/i },
  { code: '17B', name: 'Old Ale', startPattern: /^# 17B\.\s+Old Ale/i },
  { code: '17C', name: 'Wee Heavy', startPattern: /^# 17C\.\s+Wee Heavy/i },
  { code: '17D', name: 'English Barley Wine', startPattern: /^# 17D\.\s+English Barley Wine/i },

  // Category 18: Pale American Ale
  { code: '18A', name: 'Blonde Ale', startPattern: /^# 18A\.\s+Blonde Ale/i },
  { code: '18B', name: 'American Pale Ale', startPattern: /^# 18B\.\s+American Pale Ale/i },

  // Category 19: Amber and Brown American Beer
  { code: '19A', name: 'American Amber Ale', startPattern: /^# 19A\.\s+American Amber Ale/i },
  { code: '19B', name: 'California Common', startPattern: /^# 19B\.\s+California Common/i },
  { code: '19C', name: 'American Brown Ale', startPattern: /^# 19C\.\s+American Brown Ale/i },

  // Category 20: American Porter and Stout
  { code: '20A', name: 'American Porter', startPattern: /^# 20A\.\s+American Porter/i },
  { code: '20B', name: 'American Stout', startPattern: /^# 20B\.\s+American Stout/i },
  { code: '20C', name: 'Imperial Stout', startPattern: /^# 20C\.\s+Imperial Stout/i },

  // Category 21: IPA
  { code: '21A', name: 'American IPA', startPattern: /^# 21A\.\s+American IPA/i },
  { code: '21B', name: 'Specialty IPA', startPattern: /^# 21B\.\s+Specialty IPA/i },
  { code: '21C', name: 'Hazy IPA', startPattern: /^# 21C\.\s+Hazy IPA/i },

  // Specialty IPA sub-styles (21B)
  { code: '21B', name: 'Belgian IPA', startPattern: /^Specialty IPA: Belgian IPA/i },
  { code: '21B', name: 'Black IPA', startPattern: /^Specialty IPA: Black IPA/i },
  { code: '21B', name: 'Brown IPA', startPattern: /^Specialty IPA: Brown IPA/i },
  { code: '21B', name: 'Red IPA', startPattern: /^Specialty IPA: Red IPA/i },
  { code: '21B', name: 'Rye IPA', startPattern: /^Specialty IPA: Rye IPA/i },
  { code: '21B', name: 'White IPA', startPattern: /^Specialty IPA: White IPA/i },
  { code: '21B', name: 'Brut IPA', startPattern: /^Specialty IPA: Brut IPA/i },

  // Category 22: Strong American Ale
  { code: '22A', name: 'Double IPA', startPattern: /^# 22A\.\s+Double IPA/i },
  { code: '22B', name: 'American Strong Ale', startPattern: /^# 22B\.\s+American Strong Ale/i },
  { code: '22C', name: 'American Barleywine', startPattern: /^# 22C\.\s+American Barleywine/i },
  { code: '22D', name: 'Wheatwine', startPattern: /^# 22D\.\s+Wheatwine/i },

  // Category 23: European Sour Ale
  { code: '23A', name: 'Berliner Weisse', startPattern: /^# 23A\.\s+Berliner Weisse/i },
  { code: '23B', name: 'Flanders Red Ale', startPattern: /^# 23B\.\s+Flanders Red Ale/i },
  { code: '23C', name: 'Oud Bruin', startPattern: /^# 23C\.\s+Oud Bruin/i },
  { code: '23D', name: 'Lambic', startPattern: /^# 23D\.\s+Lambic/i },
  { code: '23E', name: 'Gueuze', startPattern: /^# 23E\.\s+Gueuze/i },
  { code: '23F', name: 'Fruit Lambic', startPattern: /^# 23F\.\s+Fruit Lambic/i },
  { code: '23G', name: 'Gose', startPattern: /^# 23G\.\s+Gose/i },

  // Category 24: Belgian Ale
  { code: '24A', name: 'Witbier', startPattern: /^# 24A\.\s+Witbier/i },
  { code: '24B', name: 'Belgian Pale Ale', startPattern: /^# 24B\.\s+Belgian Pale Ale/i },
  { code: '24C', name: 'Bière de Garde', startPattern: /^# 24C\.\s+Bière de Garde/i },

  // Category 25: Strong Belgian Ale
  { code: '25A', name: 'Belgian Blond Ale', startPattern: /^# 25A\.\s+Belgian Blond Ale/i },
  { code: '25B', name: 'Saison', startPattern: /^# 25B\.\s+Saison/i },
  { code: '25C', name: 'Belgian Golden Strong Ale', startPattern: /^# 25C\.\s+Belgian Golden Strong Ale/i },

  // Category 26: Monastic Ale
  { code: '26A', name: 'Belgian Single', startPattern: /^# 26A\.\s+Belgian Single/i },
  { code: '26B', name: 'Belgian Dubbel', startPattern: /^# 26B\.\s+Belgian Dubbel/i },
  { code: '26C', name: 'Belgian Tripel', startPattern: /^# 26C\.\s+Belgian Tripel/i },
  { code: '26D', name: 'Belgian Dark Strong Ale', startPattern: /^# 26D\.\s+Belgian Dark Strong Ale/i },

  // Category 27: Historical Beer (special handling needed)
  { code: '27', name: 'Kellerbier', startPattern: /^Historical Beer: Kellerbier/i },
  { code: '27', name: 'Kentucky Common', startPattern: /^Historical Beer: Kentucky Common/i },
  { code: '27', name: 'Lichtenhainer', startPattern: /^Historical Beer: Lichtenhainer/i },
  { code: '27', name: 'London Brown Ale', startPattern: /^Historical Beer: London Brown Ale/i },
  { code: '27', name: 'Piwo Grodziskie', startPattern: /^Historical Beer: Piwo Grodziskie/i },
  { code: '27', name: 'Pre-Prohibition Lager', startPattern: /^Historical Beer: Pre-Prohibition Lager/i },
  { code: '27', name: 'Pre-Prohibition Porter', startPattern: /^Historical Beer: Pre-Prohibition Porter/i },
  { code: '27', name: 'Roggenbier', startPattern: /^Historical Beer: Roggenbier/i },
  { code: '27', name: 'Sahti', startPattern: /^Historical Beer: Sahti/i },

  // Category 28: American Wild Ale
  { code: '28A', name: 'Brett Beer', startPattern: /^# 28A\.\s+Brett Beer/i },
  { code: '28B', name: 'Mixed-Fermentation Sour Beer', startPattern: /^# 28B\.\s+Mixed-Fermentation Sour Beer/i },
  { code: '28C', name: 'Wild Specialty Beer', startPattern: /^# 28C\.\s+Wild Specialty Beer/i },
  { code: '28D', name: 'Straight Sour Beer', startPattern: /^# 28D\.\s+Straight Sour Beer/i },

  // Category 29: Fruit Beer
  { code: '29A', name: 'Fruit Beer', startPattern: /^# 29A\.\s+Fruit Beer/i },
  { code: '29B', name: 'Fruit and Spice Beer', startPattern: /^# 29B\.\s+Fruit and Spice Beer/i },
  { code: '29C', name: 'Specialty Fruit Beer', startPattern: /^# 29C\.\s+Specialty Fruit Beer/i },
  { code: '29D', name: 'Grape Ale', startPattern: /^# 29D\.\s+Grape Ale/i },

  // Category 30: Spiced Beer
  { code: '30A', name: 'Spice, Herb, or Vegetable Beer', startPattern: /^# 30A\.\s+Spice, Herb, or Vegetable Beer/i },
  { code: '30B', name: 'Autumn Seasonal Beer', startPattern: /^# 30B\.\s+Autumn Seasonal Beer/i },
  { code: '30C', name: 'Winter Seasonal Beer', startPattern: /^# 30C\.\s+Winter Seasonal Beer/i },
  { code: '30D', name: 'Specialty Spice Beer', startPattern: /^# 30D\.\s+Specialty Spice Beer/i },

  // Category 31: Alternative Fermentables Beer
  { code: '31A', name: 'Alternative Grain Beer', startPattern: /^# 31A\.\s+Alternative Grain Beer/i },
  { code: '31B', name: 'Alternative Sugar Beer', startPattern: /^# 31B\.\s+Alternative Sugar Beer/i },

  // Category 32: Smoked Beer
  { code: '32A', name: 'Classic Style Smoked Beer', startPattern: /^# 32A\.\s+Classic Style Smoked Beer/i },
  { code: '32B', name: 'Specialty Smoked Beer', startPattern: /^# 32B\.\s+Specialty Smoked Beer/i },

  // Category 33: Wood Beer
  { code: '33A', name: 'Wood-Aged Beer', startPattern: /^# 33A\.\s+Wood-Aged Beer/i },
  { code: '33B', name: 'Specialty Wood-Aged Beer', startPattern: /^# 33B\.\s+Specialty Wood-Aged Beer/i },

  // Category 34: Specialty Beer
  { code: '34A', name: 'Commercial Specialty Beer', startPattern: /^# 34A\.\s+Commercial Specialty Beer/i },
  { code: '34B', name: 'Mixed-Style Beer', startPattern: /^# 34B\.\s+Mixed-Style Beer/i },
  { code: '34C', name: 'Experimental Beer', startPattern: /^# 34C\.\s+Experimental Beer/i },

  // Appendix B: Local Styles
  { code: 'X1', name: 'Dorada Pampeana', startPattern: /^# X1\.\s+Dorada Pampeana/i },
  { code: 'X2', name: 'IPA Argenta', startPattern: /^# X2\.\s+IPA Argenta/i },
  { code: 'X3', name: 'Italian Grape Ale', startPattern: /^# X3\.\s+Italian Grape Ale/i },
  { code: 'X4', name: 'Catharina Sour', startPattern: /^# X4\.\s+Catharina Sour/i },
  { code: 'X5', name: 'New Zealand Pilsner', startPattern: /^# X5\.\s+New Zealand Pilsner/i },
];

function extractStyleContent(styleName, startPattern) {
  let startIndex = -1;
  let endIndex = -1;
  
  // Find start of style
  for (let i = 0; i < lines.length; i++) {
    if (startPattern.test(lines[i])) {
      startIndex = i;
      break;
    }
  }
  
  if (startIndex === -1) {
    console.log(`Style not found: ${styleName}`);
    return null;
  }
  
  // Find end of style (next style or major section)
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    // Look for next style heading or major section
    if (line.match(/^# \d+[A-Z]\.\s+/) || line.match(/^# \d+\.\s+/) || line.match(/^# [A-Z]/)) {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === -1) {
    endIndex = lines.length;
  }
  
  return lines.slice(startIndex, endIndex).join('\n');
}

function parseStyleContent(content, styleInfo) {
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
    vital_stats: {},
    commercial_examples: {},
    tags: []
  };
  
  const lines = content.split('\n');
  let currentSection = '';
  let currentContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip the main heading
    if (line.match(/^# \d+[A-Z]\./)) {
      continue;
    }
    
    // Check for section headings
    if (line.match(/^## Overall Impression/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'overall_impression';
      currentContent = [];
    } else if (line.match(/^## Aroma/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'aroma';
      currentContent = [];
    } else if (line.match(/^## Appearance/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'appearance';
      currentContent = [];
    } else if (line.match(/^## Flavor/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'flavor';
      currentContent = [];
    } else if (line.match(/^## Mouthfeel/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'mouthfeel';
      currentContent = [];
    } else if (line.match(/^## Comments/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'comments';
      currentContent = [];
    } else if (line.match(/^## History/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'history';
      currentContent = [];
    } else if (line.match(/^## Characteristic Ingredients/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'characteristic_ingredients';
      currentContent = [];
    } else if (line.match(/^## Style Comparison/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'style_comparison';
      currentContent = [];
    } else if (line.match(/^## Vital Statistics/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'vital_stats';
      currentContent = [];
    } else if (line.match(/^## Commercial Examples/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'commercial_examples';
      currentContent = [];
    } else if (line.match(/^## Tags/i)) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'tags';
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  
  // Save the last section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  return sections;
}

function generateMarkdownFile(styleInfo, sections) {
  const fileName = `${styleInfo.code.toLowerCase()}-${styleInfo.name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.md`;
  
  const categoryMap = {
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
    '34': 'Specialty Beer'
  };
  
  const category = styleInfo.code.charAt(0) + (styleInfo.code.charAt(1) || '');
  const categoryName = categoryMap[category] || 'Unknown Category';
  
  let markdown = `---
style_code: "${styleInfo.code}"
style_name: "${styleInfo.name}"
category: "${category}"
category_name: "${categoryName}"
bjcp_2021: true
---

# ${styleInfo.code}. ${styleInfo.name}

`;

  if (sections.overall_impression) {
    markdown += `## Overall Impression

${sections.overall_impression}

`;
  }

  if (sections.aroma) {
    markdown += `## Aroma

${sections.aroma}

`;
  }

  if (sections.appearance) {
    markdown += `## Appearance

${sections.appearance}

`;
  }

  if (sections.flavor) {
    markdown += `## Flavor

${sections.flavor}

`;
  }

  if (sections.mouthfeel) {
    markdown += `## Mouthfeel

${sections.mouthfeel}

`;
  }

  if (sections.comments) {
    markdown += `## Comments

${sections.comments}

`;
  }

  if (sections.history) {
    markdown += `## History

${sections.history}

`;
  }

  if (sections.characteristic_ingredients) {
    markdown += `## Characteristic Ingredients

${sections.characteristic_ingredients}

`;
  }

  if (sections.style_comparison) {
    markdown += `## Style Comparison

${sections.style_comparison}

`;
  }

  if (sections.vital_stats) {
    markdown += `## Vital Statistics

${sections.vital_stats}

`;
  }

  if (sections.commercial_examples) {
    markdown += `## Commercial Examples

${sections.commercial_examples}

`;
  }

  if (sections.tags) {
    markdown += `## Tags

${sections.tags}

`;
  }

  return { fileName, content: markdown };
}

// Process each style
console.log('Extracting BJCP beer styles...');

let processedCount = 0;
let skippedCount = 0;

for (const styleInfo of STYLE_PATTERNS) {
  const content = extractStyleContent(styleInfo.name, styleInfo.startPattern);
  
  if (content) {
    const sections = parseStyleContent(content, styleInfo);
    const { fileName, content: markdownContent } = generateMarkdownFile(styleInfo, sections);
    
    const filePath = path.join(outputDir, fileName);
    
    // Only write if file doesn't exist to avoid overwriting
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, markdownContent, 'utf-8');
      console.log(`✅ Created: ${fileName}`);
      processedCount++;
    } else {
      console.log(`⚠️  Skipped (exists): ${fileName}`);
      skippedCount++;
    }
  } else {
    console.log(`❌ Failed to extract: ${styleInfo.name}`);
    skippedCount++;
  }
}

console.log(`\nProcessing complete:`);
console.log(`✅ Created: ${processedCount} files`);
console.log(`⚠️  Skipped: ${skippedCount} files`);
console.log(`📁 Output directory: ${outputDir}`);

export { STYLE_PATTERNS }; 