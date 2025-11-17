const fs = require('fs');
const path = require('path');

// Define all missing BJCP styles including specialty IPA sub-styles
const STYLE_DEFINITIONS = {
  // 21B Specialty IPA Sub-styles
  '21B-Belgian': { name: 'Belgian IPA', category: '21B', fullName: 'Specialty IPA: Belgian IPA' },
  '21B-Black': { name: 'Black IPA', category: '21B', fullName: 'Specialty IPA: Black IPA' },
  '21B-Brown': { name: 'Brown IPA', category: '21B', fullName: 'Specialty IPA: Brown IPA' },
  '21B-Red': { name: 'Red IPA', category: '21B', fullName: 'Specialty IPA: Red IPA' },
  '21B-Rye': { name: 'Rye IPA', category: '21B', fullName: 'Specialty IPA: Rye IPA' },
  '21B-White': { name: 'White IPA', category: '21B', fullName: 'Specialty IPA: White IPA' },
  '21B-Brut': { name: 'Brut IPA', category: '21B', fullName: 'Specialty IPA: Brut IPA' },
  
  // Historical Beers (Category 27)
  '27A': { name: 'Kellerbier', category: '27', fullName: 'Historical Beer: Kellerbier' },
  '27B': { name: 'Kentucky Common', category: '27', fullName: 'Historical Beer: Kentucky Common' },
  '27C': { name: 'Lichtenhainer', category: '27', fullName: 'Historical Beer: Lichtenhainer' },
  '27D': { name: 'London Brown Ale', category: '27', fullName: 'Historical Beer: London Brown Ale' },
  '27E': { name: 'Piwo Grodziskie', category: '27', fullName: 'Historical Beer: Piwo Grodziskie' },
  '27F': { name: 'Pre-Prohibition Lager', category: '27', fullName: 'Historical Beer: Pre-Prohibition Lager' },
  '27G': { name: 'Pre-Prohibition Porter', category: '27', fullName: 'Historical Beer: Pre-Prohibition Porter' },
  '27H': { name: 'Roggenbier', category: '27', fullName: 'Historical Beer: Roggenbier' },
  '27I': { name: 'Sahti', category: '27', fullName: 'Historical Beer: Sahti' }
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
  
  let startPattern, searchPattern;
  
  if (styleCode.startsWith('21B')) {
    // Specialty IPA sub-styles use ### **Specialty IPA: Name** format
    startPattern = `### **${styleInfo.fullName}**`;
    searchPattern = startPattern;
  } else if (styleCode.startsWith('27')) {
    // Historical beer styles use ### **Historical Beer: Name** format
    startPattern = `### **${styleInfo.fullName}**`;
    searchPattern = startPattern;
  }
  
  const startIndex = content.indexOf(searchPattern);
  
  if (startIndex === -1) {
    console.log(`Warning: Could not find start pattern for ${styleInfo.name}: "${searchPattern}"`);
    return null;
  }
  
  // Find the end of this section
  let endIndex = content.length;
  
  if (styleCode.startsWith('21B')) {
    // For Specialty IPAs, look for next ### **Specialty IPA: or next major section
    const nextSpecialtyIPA = content.indexOf('### **Specialty IPA:', startIndex + startPattern.length);
    const nextMajorSection = content.indexOf('21C. Hazy IPA', startIndex + startPattern.length);
    const bjcpEnd = content.indexOf('*BJCP Beer Style Guidelines', startIndex + startPattern.length);
    
    if (nextSpecialtyIPA !== -1) endIndex = Math.min(endIndex, nextSpecialtyIPA);
    if (nextMajorSection !== -1) endIndex = Math.min(endIndex, nextMajorSection);
    if (bjcpEnd !== -1) endIndex = Math.min(endIndex, bjcpEnd);
  } else if (styleCode.startsWith('27')) {
    // For Historical beers, look for next ### **Historical Beer: or major section
    const nextHistoricalBeer = content.indexOf('### **Historical Beer:', startIndex + startPattern.length);
    const introToSpecialty = content.indexOf('INTRODUCTION TO SPECIALTY-TYPE BEER', startIndex + startPattern.length);
    const bjcpEnd = content.indexOf('*BJCP Beer Style Guidelines', startIndex + startPattern.length);
    
    if (nextHistoricalBeer !== -1) endIndex = Math.min(endIndex, nextHistoricalBeer);
    if (introToSpecialty !== -1) endIndex = Math.min(endIndex, introToSpecialty);
    if (bjcpEnd !== -1) endIndex = Math.min(endIndex, bjcpEnd);
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

// Function to create markdown file for a style
function createStyleFile(styleCode, styleInfo, sections) {
  const filename = `${styleCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${styleInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
  const filepath = path.join('src/data/beers/style-guide', filename);
  
  // Determine category info and tags
  let categoryName = '';
  let tags = [];
  
  if (styleCode.startsWith('21B')) {
    categoryName = 'Specialty IPA';
    tags = ['specialty-ipa', 'ipa-family', 'craft-style', 'bitter', 'hoppy'];
  } else if (styleCode.startsWith('27')) {
    categoryName = 'Historical Beer';
    tags = ['historical-beer', 'traditional-style'];
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
  console.log(`Created: ${filename}`);
  return filename;
}

// Main extraction function
function extractAllStyles() {
  const guidelinesPath = path.join('src/data/beers/style-guide', 'style_guidelines_bjcp_2021.md');
  
  if (!fs.existsSync(guidelinesPath)) {
    console.error('BJCP guidelines file not found!');
    return;
  }
  
  const content = fs.readFileSync(guidelinesPath, 'utf8');
  console.log('Loaded BJCP 2021 Guidelines');
  console.log(`File size: ${content.length} characters`);
  
  let extractedCount = 0;
  let failedCount = 0;
  
  // Process each style definition
  for (const [styleCode, styleInfo] of Object.entries(STYLE_DEFINITIONS)) {
    const sections = extractStyleSection(content, styleCode, styleInfo);
    if (sections) {
      createStyleFile(styleCode, styleInfo, sections);
      extractedCount++;
    } else {
      console.log(`Failed to extract: ${styleCode} ${styleInfo.name}`);
      failedCount++;
    }
  }
  
  console.log(`\nExtraction complete!`);
  console.log(`Successfully extracted: ${extractedCount} styles`);
  console.log(`Failed extractions: ${failedCount} styles`);
  
  if (failedCount > 0) {
    console.log('\nYou may need to manually review the failed extractions.');
  }
}

// Run the extraction
if (require.main === module) {
  extractAllStyles();
}

module.exports = { extractAllStyles }; 