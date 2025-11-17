const fs = require('fs');
const path = require('path');

// Define all BJCP style categories including specialty and local styles
const STYLE_DEFINITIONS = {
  // Historical Beer (Category 27)
  '27A': 'Kellerbier',
  '27B': 'Kentucky Common', 
  '27C': 'Lichtenhainer',
  '27D': 'London Brown Ale',
  '27E': 'Piwo Grodziskie',
  '27F': 'Pre-Prohibition Lager',
  '27G': 'Pre-Prohibition Porter',
  '27H': 'Roggenbier',
  '27I': 'Sahti',
  
  // American Wild Ale (Category 28)
  '28A': 'Brett Beer',
  '28B': 'Mixed-Fermentation Sour Beer',
  '28C': 'Wild Specialty Beer',
  '28D': 'Straight Sour Beer',
  
  // Fruit Beer (Category 29)
  '29A': 'Fruit Beer',
  '29B': 'Fruit and Spice Beer',
  '29C': 'Specialty Fruit Beer',
  '29D': 'Grape Ale',
  
  // Spiced Beer (Category 30)
  '30A': 'Spice, Herb, or Vegetable Beer',
  '30B': 'Autumn Seasonal Beer',
  '30C': 'Winter Seasonal Beer',
  '30D': 'Specialty Spice Beer',
  
  // Alternative Fermentables Beer (Category 31)
  '31A': 'Alternative Grain Beer',
  '31B': 'Alternative Sugar Beer',
  
  // Smoked Beer (Category 32)
  '32A': 'Classic Style Smoked Beer',
  '32B': 'Specialty Smoked Beer',
  
  // Wood Beer (Category 33)
  '33A': 'Wood-Aged Beer',
  '33B': 'Specialty Wood-Aged Beer',
  
  // Specialty Beer (Category 34)
  '34A': 'Commercial Specialty Beer',
  '34B': 'Mixed-Style Beer',
  '34C': 'Experimental Beer',
  
  // Local Styles (Appendix B)
  'X1': 'Dorada Pampeana',
  'X2': 'IPA Argenta',
  'X3': 'Italian Grape Ale',
  'X4': 'Catharina Sour',
  'X5': 'New Zealand Pilsner'
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
function extractStyleSection(content, styleName, styleCode) {
  console.log(`Extracting ${styleName} (${styleCode})...`);
  
  // Create different search patterns for different style formats
  let searchPatterns = [];
  
  if (styleCode.startsWith('27')) {
    // Historical beer styles use ### **Historical Beer: Name** format
    searchPatterns = [
      new RegExp(`###.*?\\*\\*Historical Beer: ${styleName}\\*\\*[\\s\\S]*?(?=###.*?\\*\\*Historical Beer:|\\*BJCP Beer Style Guidelines|28\\.|$)`, 'i'),
      new RegExp(`\\*\\*Historical Beer: ${styleName}\\*\\*[\\s\\S]*?(?=\\*\\*Historical Beer:|\\*BJCP Beer Style Guidelines|28\\.|$)`, 'i')
    ];
  } else if (styleCode.startsWith('X')) {
    // Local styles format
    searchPatterns = [
      new RegExp(`${styleCode}\\. ${styleName}[\\s\\S]*?(?=X\\d\\.|$)`, 'i'),
      new RegExp(`\\*\\*${styleCode}\\. ${styleName}\\*\\*[\\s\\S]*?(?=\\*\\*X\\d\\.|$)`, 'i')
    ];
  } else {
    // Standard format for categories 28-34  
    searchPatterns = [
      new RegExp(`##.*?\\*\\*${styleCode}\\. ${styleName}\\*\\*[\\s\\S]*?(?=##.*?\\*\\*\\d+[A-Z]\\.|##.*?\\*\\*\\d+\\.|APPENDIX|$)`, 'i'),
      new RegExp(`\\*\\*${styleCode}\\. ${styleName}\\*\\*[\\s\\S]*?(?=\\*\\*\\d+[A-Z]\\.|\\*\\*\\d+\\.|APPENDIX|$)`, 'i'),
      new RegExp(`${styleCode}\\. ${styleName}[\\s\\S]*?(?=\\d+[A-Z]\\.|\\d+\\.|APPENDIX|$)`, 'i')
    ];
  }
  
  let extractedContent = null;
  
  for (const pattern of searchPatterns) {
    const match = content.match(pattern);
    if (match) {
      extractedContent = match[0];
      break;
    }
  }
  
  if (!extractedContent) {
    console.log(`Warning: Could not find content for ${styleName}`);
    return null;
  }
  
  // Clean and structure the content
  const cleanedContent = cleanText(extractedContent);
  
  // Try to parse standard BJCP sections
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
  
  // Parse sections with various formats - simplified patterns
  const sectionPatterns = {
    overall_impression: /Overall Impression:?\s*(.*?)(?=Aroma:|Appearance:|Flavor:|$)/is,
    aroma: /Aroma:?\s*(.*?)(?=Appearance:|Flavor:|Mouthfeel:|$)/is,
    appearance: /Appearance:?\s*(.*?)(?=Flavor:|Mouthfeel:|Comments:|$)/is,
    flavor: /Flavor:?\s*(.*?)(?=Mouthfeel:|Comments:|History:|$)/is,
    mouthfeel: /Mouthfeel:?\s*(.*?)(?=Comments:|History:|Characteristic:|$)/is,
    comments: /Comments:?\s*(.*?)(?=History:|Characteristic:|Style:|$)/is,
    history: /History:?\s*(.*?)(?=Characteristic:|Style:|Entry:|$)/is,
    characteristic_ingredients: /Characteristic Ingredients:?\s*(.*?)(?=Style:|Entry:|Vital:|$)/is,
    style_comparison: /Style Comparison:?\s*(.*?)(?=Entry:|Vital:|Commercial:|$)/is,
    entry_instructions: /Entry Instructions:?\s*(.*?)(?=Vital:|Commercial:|Tags:|$)/is,
    vital_statistics: /Vital Statistics:?\s*(.*?)(?=Commercial:|Tags:|$)/is,
    commercial_examples: /Commercial Examples:?\s*(.*?)(?=Tags:|$)/is,
    tags: /Tags:?\s*(.*?)$/is
  };
  
  for (const [key, pattern] of Object.entries(sectionPatterns)) {
    const match = cleanedContent.match(pattern);
    if (match && match[1]) {
      sections[key] = match[1].trim();
    }
  }
  
  return sections;
}

// Function to create markdown file for a style
function createStyleFile(styleCode, styleName, sections) {
  const filename = `${styleCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${styleName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
  const filepath = path.join('src/data/beers/style-guide', filename);
  
  // Determine category info
  let categoryName = '';
  let tags = [];
  
  if (styleCode.startsWith('27')) {
    categoryName = 'Historical Beer';
    tags = ['historical-beer', 'traditional-style'];
  } else if (styleCode.startsWith('28')) {
    categoryName = 'American Wild Ale';
    tags = ['american-wild-ale', 'wild-fermentation'];
  } else if (styleCode.startsWith('29')) {
    categoryName = 'Fruit Beer';
    tags = ['fruit-beer', 'specialty-beer'];
  } else if (styleCode.startsWith('30')) {
    categoryName = 'Spiced Beer';
    tags = ['spiced-beer', 'specialty-beer'];
  } else if (styleCode.startsWith('31')) {
    categoryName = 'Alternative Fermentables Beer';
    tags = ['alternative-fermentables', 'specialty-beer'];
  } else if (styleCode.startsWith('32')) {
    categoryName = 'Smoked Beer';
    tags = ['smoked-beer', 'specialty-beer'];
  } else if (styleCode.startsWith('33')) {
    categoryName = 'Wood Beer';
    tags = ['wood-beer', 'specialty-beer'];
  } else if (styleCode.startsWith('34')) {
    categoryName = 'Specialty Beer';
    tags = ['specialty-beer'];
  } else if (styleCode.startsWith('X')) {
    categoryName = 'Local Styles';
    tags = ['local-style', 'regional'];
  }
  
  // Extract tags from sections if available
  if (sections.tags) {
    const extractedTags = sections.tags.split(/[,\s]+/).filter(tag => tag.length > 0);
    tags = [...new Set([...tags, ...extractedTags])];
  }
  
  let content = `---
style_code: "${styleCode}"
style_name: "${styleName}"
category: "${styleCode.charAt(0) === 'X' ? 'X' : styleCode.match(/^\d+/)?.[0] || styleCode}"
category_name: "${categoryName}"
bjcp_2021: true
tags: ${JSON.stringify(tags)}
---

# ${styleCode}. ${styleName}
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
  console.log(`Created: ${filename}`);
  return filename;
}

// Main extraction function
function extractMissingStyles() {
  const guidelinesPath = path.join('src/data/beers/style-guide', 'style_guidelines_bjcp_2021.md');
  
  if (!fs.existsSync(guidelinesPath)) {
    console.error('BJCP guidelines file not found!');
    return;
  }
  
  const content = fs.readFileSync(guidelinesPath, 'utf8');
  console.log('Loaded BJCP 2021 Guidelines');
  
  let extractedCount = 0;
  let failedCount = 0;
  
  // Process each style definition
  for (const [styleCode, styleName] of Object.entries(STYLE_DEFINITIONS)) {
    const sections = extractStyleSection(content, styleName, styleCode);
    if (sections) {
      createStyleFile(styleCode, styleName, sections);
      extractedCount++;
    } else {
      console.log(`Failed to extract: ${styleCode} ${styleName}`);
      failedCount++;
    }
  }
  
  console.log(`\nExtraction complete!`);
  console.log(`Successfully extracted: ${extractedCount} styles`);
  console.log(`Failed extractions: ${failedCount} styles`);
  
  if (failedCount > 0) {
    console.log('\nYou may need to manually review the failed extractions and update the parsing patterns.');
  }
}

// Run the extraction
if (require.main === module) {
  extractMissingStyles();
}

module.exports = { extractMissingStyles, extractStyleSection, createStyleFile }; 