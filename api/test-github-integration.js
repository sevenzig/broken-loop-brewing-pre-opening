require('dotenv').config({ path: '../.env' });
const { GitHubService } = require('./dist/lib/services/GitHubService');
const { ValidationService } = require('./dist/lib/services/ValidationService');
const { ConflictResolutionService } = require('./dist/lib/services/ConflictResolutionService');
const { ContentManagerService } = require('./dist/lib/services/ContentManagerService');

async function testRealGitHubIntegration() {
  console.log('🚀 Testing GitHub Integration with Real Repository...\n');
  
  const githubConfig = {
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
    contentPath: process.env.CONTENT_PATH || 'src/data/beers'
  };
  
  console.log('📋 Configuration:');
  console.log('   Owner:', githubConfig.owner);
  console.log('   Repo:', githubConfig.repo);
  console.log('   Branch:', githubConfig.branch);
  console.log('   Content Path:', githubConfig.contentPath);
  console.log('   Token:', githubConfig.token ? '***configured***' : 'NOT SET');
  
  if (!githubConfig.token) {
    console.log('❌ GitHub token not configured. Please set GITHUB_TOKEN in .env file');
    return;
  }
  
  console.log('\n🧪 Testing GitHubService...');
  
  const githubService = new GitHubService(githubConfig);
  
  try {
    // Test repository validation
    const validation = await githubService.validateRepository();
    console.log('✅ Repository validation:', validation.isValid ? 'PASSED' : 'FAILED');
    
    if (!validation.isValid) {
      console.log('   Errors:', validation.errors);
    }
    
    if (validation.warnings.length > 0) {
      console.log('   Warnings:', validation.warnings);
    }
    
    if (validation.isValid) {
      // Test repository info
      const repoInfo = await githubService.getRepositoryInfo();
      console.log('✅ Repository info retrieved:');
      console.log('   Name:', repoInfo.name);
      console.log('   Description:', repoInfo.description || 'No description');
      
      // Test directory listing
      console.log('\n🧪 Testing directory operations...');
      const files = await githubService.listDirectory(githubConfig.contentPath);
      console.log('✅ Directory listing successful:', files.length, 'items found');
      
      if (files.length > 0) {
        console.log('   Sample files:');
        files.slice(0, 3).forEach(file => {
          console.log('   -', file.name, `(${file.type})`);
        });
        
        // Test reading a file
        const firstMarkdownFile = files.find(f => f.name.endsWith('.md'));
        if (firstMarkdownFile) {
          console.log('\n🧪 Testing file read...');
          const filePath = `${githubConfig.contentPath}/${firstMarkdownFile.name}`;
          const content = await githubService.getFileContent(filePath);
          
          if (content) {
            console.log('✅ File read successful:');
            console.log('   File:', firstMarkdownFile.name);
            console.log('   Size:', content.length, 'characters');
            console.log('   Preview:', content.substring(0, 100) + '...');
          }
        }
      }
      
      // Test ContentManagerService with real GitHub
      console.log('\n🧪 Testing ContentManagerService with GitHub...');
      const validationService = new ValidationService();
      const conflictService = new ConflictResolutionService();
      const contentManager = new ContentManagerService(githubService, validationService, conflictService);
      
      await contentManager.initialize();
      console.log('✅ ContentManagerService with GitHub initialized successfully');
      
      // Test listing beer content
      const beerList = await contentManager.listContent('beer', { limit: 5 });
      console.log('✅ Content listing successful:', beerList.total, 'beers found');
      
      if (beerList.items.length > 0) {
        console.log('   Sample beers:');
        beerList.items.slice(0, 2).forEach(beer => {
          console.log('   -', beer.metadata.name || beer.id);
        });
        
        // Test getting a specific beer
        const firstBeer = beerList.items[0];
        const beerDetails = await contentManager.getContent('beer', firstBeer.id, { validate: true });
        
        if (beerDetails) {
          console.log('✅ Individual content retrieval successful:');
          console.log('   Beer:', beerDetails.metadata.name);
          console.log('   Status:', beerDetails.metadata.status);
          console.log('   Content length:', beerDetails.content.length, 'characters');
        }
      }
      
    }
    
  } catch (error) {
    console.error('❌ GitHub integration test failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('💡 This might be due to an invalid or expired GitHub token');
    } else if (error.message.includes('404')) {
      console.log('💡 This might be due to repository not found or insufficient permissions');
    }
  }
}

async function testValidationRules() {
  console.log('\n🧪 Testing Validation Rules...');
  
  const validationService = new ValidationService();
  await validationService.initialize();
  
  // Test various content validation scenarios
  const testCases = [
    {
      name: 'Valid Beer',
      content: {
        id: 'test-ipa',
        type: 'beer',
        slug: 'test-ipa',
        metadata: {
          name: 'Test IPA',
          slug: 'test-ipa',
          status: 'on-tap',
          abv: '6.2%',
          ibu: '55',
          style: 'American IPA',
          brief_description: 'A delicious test IPA'
        },
        content: 'This is a comprehensive description of our test IPA beer.',
        lastModified: new Date().toISOString(),
        filePath: 'test-ipa.md',
        version: '1'
      },
      shouldPass: true
    },
    {
      name: 'Beer with Missing Required Fields',
      content: {
        id: 'invalid-beer',
        type: 'beer',
        slug: 'invalid-beer',
        metadata: {
          // Missing name and status
          abv: '5.0%'
        },
        content: 'Short',
        lastModified: new Date().toISOString(),
        filePath: 'invalid-beer.md',
        version: '1'
      },
      shouldPass: false
    },
    {
      name: 'Valid Food Item',
      content: {
        id: 'test-burger',
        type: 'food',
        slug: 'test-burger',
        metadata: {
          name: 'Test Burger',
          category: 'mains',
          status: 'available',
          price: '$12.99',
          brief_description: 'A delicious test burger'
        },
        content: 'Our signature test burger with fresh ingredients.',
        lastModified: new Date().toISOString(),
        filePath: 'test-burger.md',
        version: '1'
      },
      shouldPass: true
    },
    {
      name: 'Valid Event',
      content: {
        id: 'test-event',
        type: 'event',
        slug: 'test-event',
        metadata: {
          name: 'Test Event',
          date: '2024-12-31',
          status: 'upcoming',
          start_time: '19:00',
          end_time: '22:00'
        },
        content: 'Join us for our exciting test event with great music and food.',
        lastModified: new Date().toISOString(),
        filePath: 'test-event.md',
        version: '1'
      },
      shouldPass: true
    }
  ];
  
  for (const testCase of testCases) {
    const validation = await validationService.validateContent(testCase.content);
    const passed = validation.isValid === testCase.shouldPass;
    
    console.log(`${passed ? '✅' : '❌'} ${testCase.name}:`, passed ? 'PASSED' : 'FAILED');
    
    if (!validation.isValid && testCase.shouldPass) {
      console.log('   Unexpected errors:', validation.errors);
    } else if (validation.isValid && !testCase.shouldPass) {
      console.log('   Expected errors but validation passed');
    } else if (!testCase.shouldPass && validation.errors.length > 0) {
      console.log('   Expected errors found:', validation.errors.length);
    }
  }
}

async function runFullTest() {
  try {
    await testRealGitHubIntegration();
    await testValidationRules();
    
    console.log('\n🎉 All integration tests completed!');
    
  } catch (error) {
    console.error('\n💥 Integration test suite failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runFullTest().catch(console.error);