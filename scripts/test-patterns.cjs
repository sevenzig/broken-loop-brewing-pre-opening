const fs = require('fs');
const path = require('path');

// Load the guidelines
const guidelinesPath = path.join('src/data/beers/style-guide', 'style_guidelines_bjcp_2021.md');
const content = fs.readFileSync(guidelinesPath, 'utf8');

// Test patterns for Kellerbier specifically
console.log('Testing patterns for Kellerbier...\n');

const kellerbierPatterns = [
  /###\s*\*\*Historical Beer: Kellerbier\*\*/i,
  /Historical Beer: Kellerbier/i,
  /\*\*Historical Beer: Kellerbier\*\*/i,
  /Kellerbier/i
];

kellerbierPatterns.forEach((pattern, i) => {
  const match = content.match(pattern);
  console.log(`Pattern ${i + 1}: ${pattern}`);
  console.log(`Match found: ${!!match}`);
  if (match) {
    console.log(`Match text: "${match[0]}"`);
    console.log(`Match index: ${match.index}`);
  }
  console.log('---');
});

// Let's also look for general content around Kellerbier
const kellerbierIndex = content.indexOf('Kellerbier');
if (kellerbierIndex !== -1) {
  console.log('\nContext around "Kellerbier":');
  console.log(content.substring(kellerbierIndex - 100, kellerbierIndex + 500));
}

// Test pattern for category 28
console.log('\n\nTesting patterns for category 28...\n');
const category28Index = content.indexOf('28A. Brett Beer');
if (category28Index !== -1) {
  console.log('Found "28A. Brett Beer" at index:', category28Index);
  console.log('Context:');
  console.log(content.substring(category28Index - 100, category28Index + 500));
} else {
  console.log('Did not find "28A. Brett Beer"');
  
  // Try alternative searches
  const alternatives = [
    '28A.',
    'Brett Beer',
    'AMERICAN WILD ALE',
    'Mixed-Fermentation'
  ];
  
  alternatives.forEach(alt => {
    const index = content.indexOf(alt);
    console.log(`"${alt}" found at index:`, index);
    if (index !== -1) {
      console.log('Context:');
      console.log(content.substring(index - 50, index + 200));
      console.log('---');
    }
  });
} 