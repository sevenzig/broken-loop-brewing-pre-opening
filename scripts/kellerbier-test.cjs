const fs = require('fs');
const path = require('path');

// Load the guidelines
const guidelinesPath = path.join('src/data/beers/style-guide', 'style_guidelines_bjcp_2021.md');
const content = fs.readFileSync(guidelinesPath, 'utf8');

console.log('Looking for Kellerbier content...\n');

// Find the start of Kellerbier section
const kellerbierStart = content.indexOf('**Historical Beer: Kellerbier**');
if (kellerbierStart === -1) {
  console.log('Could not find **Historical Beer: Kellerbier**');
  process.exit(1);
}

console.log('Found Kellerbier at index:', kellerbierStart);

// Get some context around it
const contextBefore = content.substring(kellerbierStart - 200, kellerbierStart);
const kellerbierSection = content.substring(kellerbierStart, kellerbierStart + 2000);

console.log('\nContext before:');
console.log(contextBefore);
console.log('\nKellerbier section:');
console.log(kellerbierSection);

// Try to find the end
const nextHistoricalBeer = content.indexOf('**Historical Beer:', kellerbierStart + 10);
const nextSection = content.indexOf('*BJCP Beer Style Guidelines', kellerbierStart + 10);

console.log('\nNext Historical Beer at:', nextHistoricalBeer);
console.log('Next BJCP section at:', nextSection);

// Extract the full section
let endIndex = Math.min(
  nextHistoricalBeer !== -1 ? nextHistoricalBeer : Infinity,
  nextSection !== -1 ? nextSection : Infinity
);

if (endIndex === Infinity) {
  endIndex = kellerbierStart + 2000; // fallback
}

const fullKellerbierSection = content.substring(kellerbierStart, endIndex);
console.log('\nFull section length:', fullKellerbierSection.length);
console.log('\nFull section:');
console.log(fullKellerbierSection); 