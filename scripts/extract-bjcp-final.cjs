const fs = require('fs');
const path = require('path');

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
function extractStyleSection(content, styleCode, styleName) {
  console.log(`Extracting ${styleName} (${styleCode})...`);
  
  // Try multiple search patterns to find the style
  const searchPatterns = [
    `## **${styleCode}. ${styleName}**`,
    `## <a name="_page[0-9]+_x[0-9.]+_y[0-9.]+"></a>**${styleCode}. ${styleName}**`,
    `**${styleCode}. ${styleName}**`,
    `# **${styleCode}. ${styleName}**`,
    `${styleCode}. ${styleName}`,
  ];
  
  let startIndex = -1;
  let usedPattern = '';
  
  for (const pattern of searchPatterns) {
    const regex = new RegExp(pattern.replace(/\*/g, '\\*').replace(/\./g, '\\.'));
    const match = content.match(regex);
    if (match) {
      startIndex = content.indexOf(match[0]);
      usedPattern = match[0];
      break;
    }
  }
  
  if (startIndex === -1) {
    console.log(`Warning: Could not find content for ${styleName} (${styleCode})`);
    return null;
  }
  
  console.log(`Found content at index ${startIndex} with pattern: ${usedPattern}`);
  
  // Find the end of this section - look for next style or major section
  let endIndex = content.length;
  
  // Look for next ## pattern
  const nextSectionRegex = /##\s*\*\*[0-9]+[A-Z]?\./g;
  nextSectionRegex.lastIndex = startIndex + usedPattern.length;
  const nextMatch = nextSectionRegex.exec(content);
  if (nextMatch) {
    endIndex = nextMatch.index;
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
    tags: /\*\*Tags:\*\*(.*?)(?=\*\*|##|$)/s
  };
  
  for (const [key, pattern] of Object.entries(sectionPatterns)) {
    const match = rawContent.match(pattern);
    if (match && match[1]) {
      sections[key] = cleanText(match[1].trim());
    }
  }
  
  return sections;
}

// Category name mapping
const CATEGORY_NAMES = {
  '4': 'Pale Malty European Lager',
  '6': 'Amber Malty European Lager',
  '7': 'Amber Bitter European Beer',
  '8': 'Dark European Lager',
  '9': 'Strong European Beer',
  '15': 'Irish Beer',
  '24': 'Belgian Ale',
  '25': 'Strong Belgian Ale',
  '34': 'Specialty Beer'
};

// Define styles that need content extraction
const STYLES_TO_FIX = [
  { code: '4B', name: 'Festbier', fileName: '4b-festbier.md' },
  { code: '6A', name: 'Märzen', fileName: '6a-marzen.md' },
  { code: '7B', name: 'Altbier', fileName: '7b-altbier.md' },
  { code: '8A', name: 'Munich Dunkel', fileName: '8a-munich-dunkel.md' },
  { code: '8B', name: 'Schwarzbier', fileName: '8b-schwarzbier.md' },
  { code: '9A', name: 'Doppelbock', fileName: '9a-doppelbock.md' },
  { code: '15B', name: 'Irish Stout', fileName: '15b-irish-stout.md' },
  { code: '24A', name: 'Witbier', fileName: '24a-witbier.md' },
  { code: '25B', name: 'Saison', fileName: '25b-saison.md' },
  { code: '34B', name: 'Mixed-Style Beer', fileName: '34b-mixed-style-beer.md' },
  { code: '34C', name: 'Experimental Beer', fileName: '34c-experimental-beer.md' }
];

// Function to create markdown file for a style
function createStyleFile(styleCode, styleName, fileName, sections) {
  const filepath = path.join('src/data/beers/style-guide', fileName);
  
  // Determine category info and tags
  const category = styleCode.replace(/[A-Z]$/, '');
  const categoryName = CATEGORY_NAMES[category] || category;
  
  let tags = ['traditional-style'];
  
  // Extract additional tags from sections if available
  if (sections.tags) {
    const extractedTags = sections.tags.split(/[,\s]+/).filter(tag => tag.length > 0);
    tags = [...new Set([...tags, ...extractedTags])];
  }
  
  let content = `---
style_code: "${styleCode}"
style_name: "${styleName}"
category: "${category}"
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
  console.log(`Updated: ${fileName}`);
  return fileName;
}

// Main extraction function
function fixEmptyStyleFiles() {
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
        console.log('Guidelines file is empty, cannot extract content');
        return;
      }
    } catch (error) {
      console.log(`Error reading guidelines file: ${error.message}`);
      return;
    }
  } else {
    console.log('Guidelines file not found');
    return;
  }
  
  let updatedCount = 0;
  let failedCount = 0;
  
  // Process each style that needs fixing
  for (const style of STYLES_TO_FIX) {
    try {
      const sections = extractStyleSection(content, style.code, style.name);
      if (sections) {
        createStyleFile(style.code, style.name, style.fileName, sections);
        updatedCount++;
      } else {
        console.log(`Failed to extract: ${style.code} ${style.name}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`Error processing ${style.code} ${style.name}: ${error.message}`);
      failedCount++;
    }
  }
  
  console.log(`\n=== Style Content Update Complete ===`);
  console.log(`Successfully updated: ${updatedCount} files`);
  console.log(`Failed updates: ${failedCount} files`);
}

// Run the extraction
if (require.main === module) {
  fixEmptyStyleFiles();
}

module.exports = { fixEmptyStyleFiles }; 