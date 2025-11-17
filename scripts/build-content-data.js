import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle Vercel build environment
const projectRoot = process.env.VERCEL ? process.cwd() : path.resolve(__dirname, '..');

async function buildContentData() {
  try {
    console.log('Building content data...');
    console.log('Current working directory:', process.cwd());
    console.log('Script directory:', __dirname);
    console.log('Project root:', projectRoot);
    
    // Build beers data with HTML processing
    await buildBeersData();
    
    // Build events data with HTML processing
    await buildEventsData();
    
    // Build food data with HTML processing
    await buildFoodData();
    
    // Build beer styles data with HTML processing
    await buildBeerStylesData();
    
    console.log('✅ All content data built successfully!');
  } catch (error) {
    console.error('❌ Failed to build content data:', error);
    process.exit(1);
  }
}

async function buildBeersData() {
  const beersDir = path.join(projectRoot, 'src/data/beers');
  const outputPath = path.join(projectRoot, 'public/data/beers.json');
  
  const files = await fs.readdir(beersDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  
  const beers = [];
  
  for (const file of markdownFiles) {
    try {
      const filePath = path.join(beersDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      // Extract UUID from filename if not in frontmatter
      if (!frontmatter.uuid) {
        const uuid = file.replace('.md', '');
        frontmatter.uuid = uuid;
      }
      
      // Process markdown content to HTML at build time
      const processedContent = await remark()
        .use(remarkHtml)
        .process(markdownContent);
      
      const beerData = {
        ...frontmatter,
        content: processedContent.toString(), // HTML content
        markdown: markdownContent, // Keep original markdown for admin editing
        slug: frontmatter.slug || file.replace('.md', '') // Ensure slug exists
      };
      
      beers.push(beerData);
    } catch (error) {
      console.error(`Failed to process beer ${file}:`, error);
    }
  }
  
  await fs.writeFile(outputPath, JSON.stringify(beers, null, 2));
  console.log(`✅ Built beer data: ${beers.length} beers`);
}

async function buildEventsData() {
  const eventsDir = path.join(projectRoot, 'src/data/events');
  const outputPath = path.join(projectRoot, 'public/data/events.json');
  
  const files = await fs.readdir(eventsDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  
  const events = [];
  
  for (const file of markdownFiles) {
    try {
      const filePath = path.join(eventsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      // Extract UUID from filename if not in frontmatter
      if (!frontmatter.uuid) {
        const uuid = file.replace('.md', '');
        frontmatter.uuid = uuid;
      }
      
      // Process markdown content to HTML at build time
      const processedContent = await remark()
        .use(remarkHtml)
        .process(markdownContent);
      
      const eventData = {
        ...frontmatter,
        content: processedContent.toString(), // HTML content
        markdown: markdownContent, // Keep original markdown for admin editing
        slug: frontmatter.slug || file.replace('.md', '') // Ensure slug exists
      };
      
      events.push(eventData);
    } catch (error) {
      console.error(`Failed to process event ${file}:`, error);
    }
  }
  
  await fs.writeFile(outputPath, JSON.stringify(events, null, 2));
  console.log(`✅ Built event data: ${events.length} events`);
}

async function buildFoodData() {
  const foodDir = path.join(projectRoot, 'src/data/food');
  const outputPath = path.join(projectRoot, 'public/data/food.json');
  
  const categories = ['appetizers', 'mains', 'sides', 'specials'];
  const allFood = [];
  
  for (const category of categories) {
    const categoryDir = path.join(foodDir, category);
    
    try {
      const files = await fs.readdir(categoryDir);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      for (const file of markdownFiles) {
        try {
          const filePath = path.join(categoryDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const { data: frontmatter, content: markdownContent } = matter(content);
          
          // Extract UUID from filename if not in frontmatter
          if (!frontmatter.uuid) {
            const uuid = file.replace('.md', '');
            frontmatter.uuid = uuid;
          }
          
          // Process markdown content to HTML at build time
          const processedContent = await remark()
            .use(remarkHtml)
            .process(markdownContent);
          
          const foodData = {
            ...frontmatter,
            content: processedContent.toString(), // HTML content
            markdown: markdownContent, // Keep original markdown for admin editing
            slug: frontmatter.slug || file.replace('.md', ''), // Ensure slug exists
            category: category // Add category information
          };
          
          allFood.push(foodData);
        } catch (error) {
          console.error(`Failed to process food ${file}:`, error);
        }
      }
    } catch (error) {
      console.error(`Failed to process category ${category}:`, error);
    }
  }
  
  await fs.writeFile(outputPath, JSON.stringify(allFood, null, 2));
  console.log(`✅ Built food data: ${allFood.length} items`);
}

async function buildBeerStylesData() {
  const stylesDir = path.join(projectRoot, 'src/data/beers/style-guide');
  const outputPath = path.join(projectRoot, 'public/data/beer-styles.json');
  
  try {
    const files = await fs.readdir(stylesDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    const styles = [];
    
    for (const file of markdownFiles) {
      try {
        const filePath = path.join(stylesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter, content: markdownContent } = matter(content);
        
        // Process markdown content to HTML at build time
        const processedContent = await remark()
          .use(remarkHtml)
          .process(markdownContent);
        
        // Parse vital statistics from content
        const vitalStats = parseVitalStats(markdownContent);
        const commercialExamples = parseCommercialExamples(markdownContent);
        
        const styleData = {
          ...frontmatter,
          content: processedContent.toString(), // HTML content
          markdown: markdownContent, // Keep original markdown
          slug: frontmatter.style_code?.toLowerCase() || file.replace('.md', ''),
          vital_stats: vitalStats,
          commercial_examples: commercialExamples
        };
        
        styles.push(styleData);
      } catch (error) {
        console.error(`Failed to process style ${file}:`, error);
      }
    }
    
    await fs.writeFile(outputPath, JSON.stringify(styles, null, 2));
    console.log(`✅ Built beer styles data: ${styles.length} styles`);
  } catch (error) {
    console.error('Failed to build beer styles data:', error);
  }
}

// Helper function to parse vital statistics from markdown
function parseVitalStats(markdown) {
  const lines = markdown.split('\n');
  const vitalStats = {};
  
  for (const line of lines) {
    // Parse vital statistics - handle multiple formats
    if (line.startsWith('- **OG:**') || line.startsWith('- **ABV:**') || 
        line.startsWith('- **IBUs:**') || line.startsWith('- **FG:**') || 
        line.startsWith('- **SRM:**')) {
      const [key, value] = line.replace('- **', '').replace('**', '').split(':');
      vitalStats[key.toLowerCase()] = value?.trim();
    } else if (line.includes('OG:') && line.includes('IBUs:') && line.includes('FG:') && line.includes('SRM:') && line.includes('ABV:')) {
      // Handle the format: "OG: 1.044 – 1.057 IBUs: 10 – 18 FG: 1.008 – 1.014 SRM: 14 – 23 ABV: 4.3 – 5.6%"
      const ogMatch = line.match(/OG:\s*([^I]+)/);
      const ibuMatch = line.match(/IBUs:\s*([^F]+)/);
      const fgMatch = line.match(/FG:\s*([^S]+)/);
      const srmMatch = line.match(/SRM:\s*([^A]+)/);
      const abvMatch = line.match(/ABV:\s*([^\s]+)/);
      
      if (ogMatch) vitalStats.og = ogMatch[1].trim();
      if (ibuMatch) vitalStats.ibu = ibuMatch[1].trim();
      if (fgMatch) vitalStats.fg = fgMatch[1].trim();
      if (srmMatch) vitalStats.srm = srmMatch[1].trim();
      if (abvMatch) vitalStats.abv = abvMatch[1].trim();
    }
  }
  
  return Object.keys(vitalStats).length > 0 ? vitalStats : undefined;
}

// Helper function to parse commercial examples from markdown
function parseCommercialExamples(markdown) {
  const lines = markdown.split('\n');
  const examples = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse commercial examples - handle multiple formats
    if (line.startsWith('**American:**') || line.startsWith('**English:**')) {
      const type = line.includes('American') ? 'american' : 'english';
      const exampleText = line.replace(/\*\*(American|English):\*\*/, '').trim();
      examples[type] = exampleText.split(',').map(ex => ex.trim());
    } else if (line.includes('Commercial Examples') && i + 1 < lines.length) {
      // Handle the format where examples are on the next line
      const nextLine = lines[i + 1].trim();
      if (nextLine && !nextLine.startsWith('##') && !nextLine.startsWith('**')) {
        examples.other = nextLine.split(',').map(ex => ex.trim());
      }
    }
  }
  
  return Object.keys(examples).length > 0 ? examples : undefined;
}

buildContentData();
