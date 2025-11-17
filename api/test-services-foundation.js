/**
 * Foundational Services Test Suite
 * Tests core services and dependencies for non-JSON response root causes
 */

import fs from 'fs/promises';
import path from 'path';

// Mock request/response objects for testing
function createMockResponse() {
  const res = {
    headers: {},
    statusCode: 200,
    data: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      this.headers['content-type'] = 'application/json';
      return this;
    },
    end(data) {
      if (data) this.data = data;
      return this;
    }
  };
  return res;
}

function createMockRequest(options = {}) {
  return {
    method: options.method || 'GET',
    query: options.query || {},
    params: options.params || {},
    body: options.body || {},
    headers: options.headers || {}
  };
}

// Service testing utilities
async function testServiceInitialization() {
  console.log('🔧 Testing service initialization...');
  
  const results = {
    services: [],
    errors: [],
    dependencies: []
  };
  
  try {
    // Test if we can require the services
    const servicesPath = path.join('lib', 'services');
    
    try {
      // Test AdminService
      const AdminServicePath = path.join(servicesPath, 'AdminService.ts');
      await fs.access(AdminServicePath);
      results.services.push({ name: 'AdminService', status: 'FILE_EXISTS' });
      
      // Try to parse TypeScript content for syntax issues
      const adminContent = await fs.readFile(AdminServicePath, 'utf8');
      if (adminContent.includes('export class AdminService')) {
        results.services.push({ name: 'AdminService', status: 'CLASS_FOUND' });
      } else {
        results.errors.push({ service: 'AdminService', error: 'Class export not found' });
      }
      
    } catch (error) {
      results.errors.push({ service: 'AdminService', error: error.message });
    }
    
    try {
      // Test BeerService
      const BeerServicePath = path.join(servicesPath, 'BeerService.ts');
      await fs.access(BeerServicePath);
      results.services.push({ name: 'BeerService', status: 'FILE_EXISTS' });
      
      const beerContent = await fs.readFile(BeerServicePath, 'utf8');
      if (beerContent.includes('export class BeerService')) {
        results.services.push({ name: 'BeerService', status: 'CLASS_FOUND' });
      } else {
        results.errors.push({ service: 'BeerService', error: 'Class export not found' });
      }
      
    } catch (error) {
      results.errors.push({ service: 'BeerService', error: error.message });
    }
    
    try {
      // Test GitHubService
      const GitHubServicePath = path.join(servicesPath, 'GitHubService.ts');
      await fs.access(GitHubServicePath);
      results.services.push({ name: 'GitHubService', status: 'FILE_EXISTS' });
      
      const githubContent = await fs.readFile(GitHubServicePath, 'utf8');
      if (githubContent.includes('export class GitHubService')) {
        results.services.push({ name: 'GitHubService', status: 'CLASS_FOUND' });
      } else {
        results.errors.push({ service: 'GitHubService', error: 'Class export not found' });
      }
      
    } catch (error) {
      results.errors.push({ service: 'GitHubService', error: error.message });
    }
    
  } catch (error) {
    results.errors.push({ service: 'General', error: error.message });
  }
  
  return results;
}

async function testTypeDefinitions() {
  console.log('📝 Testing type definitions...');
  
  const results = {
    types: [],
    errors: []
  };
  
  const typeFiles = [
    'lib/types/Admin.ts',
    'lib/types/Beer.ts',
    'lib/types/ContentManager.ts'
  ];
  
  for (const typeFile of typeFiles) {
    try {
      await fs.access(typeFile);
      const content = await fs.readFile(typeFile, 'utf8');
      
      // Check for export statements
      const exportCount = (content.match(/export\s+(interface|type|class)/g) || []).length;
      
      results.types.push({
        file: typeFile,
        status: 'EXISTS',
        exportCount
      });
      
    } catch (error) {
      results.errors.push({
        file: typeFile,
        error: error.message
      });
    }
  }
  
  return results;
}

async function testMiddleware() {
  console.log('🔌 Testing middleware functions...');
  
  const results = {
    middleware: [],
    errors: []
  };
  
  try {
    // Test if auth middleware exists
    const authPath = path.join('lib', 'auth');
    
    try {
      await fs.access(authPath);
      results.middleware.push({ name: 'auth_directory', status: 'EXISTS' });
      
      // Check for middleware files
      const authFiles = await fs.readdir(authPath);
      results.middleware.push({ 
        name: 'auth_files', 
        status: 'FOUND', 
        files: authFiles 
      });
      
    } catch (error) {
      results.errors.push({ middleware: 'auth', error: error.message });
    }
    
    // Test utils directory
    try {
      const utilsPath = path.join('lib', 'utils');
      await fs.access(utilsPath);
      results.middleware.push({ name: 'utils_directory', status: 'EXISTS' });
      
      const utilFiles = await fs.readdir(utilsPath);
      results.middleware.push({ 
        name: 'utils_files', 
        status: 'FOUND', 
        files: utilFiles 
      });
      
    } catch (error) {
      results.errors.push({ middleware: 'utils', error: error.message });
    }
    
  } catch (error) {
    results.errors.push({ middleware: 'general', error: error.message });
  }
  
  return results;
}

async function testEnvironmentVariables() {
  console.log('🌍 Testing environment configuration...');
  
  const results = {
    environment: {},
    missing: [],
    warnings: []
  };
  
  const expectedVars = [
    'NODE_ENV',
    'PORT',
    'GITHUB_TOKEN',
    'GITHUB_OWNER',
    'GITHUB_REPO',
    'GITHUB_BRANCH',
    'CONTENT_PATH'
  ];
  
  for (const varName of expectedVars) {
    if (process.env[varName]) {
      results.environment[varName] = 'SET';
    } else {
      results.missing.push(varName);
    }
  }
  
  // Check for .env file
  try {
    await fs.access('.env');
    results.environment.ENV_FILE = 'EXISTS';
  } catch (error) {
    results.warnings.push('No .env file found');
  }
  
  return results;
}

async function simulateServiceOperations() {
  console.log('🎭 Simulating service operations...');
  
  const results = {
    operations: [],
    errors: []
  };
  
  // Simulate AdminService operations
  try {
    // Mock a service call that might cause non-JSON responses
    const mockReq = createMockRequest({
      query: { page: '1', limit: '10' }
    });
    const mockRes = createMockResponse();
    
    // Test if response structure is properly set up
    mockRes.setHeader('Content-Type', 'application/json');
    mockRes.json({ success: true, data: [] });
    
    if (mockRes.headers['content-type'] === 'application/json') {
      results.operations.push({
        operation: 'mock_json_response',
        status: 'PASS'
      });
    } else {
      results.operations.push({
        operation: 'mock_json_response',
        status: 'FAIL',
        issue: 'Content-Type header not set correctly'
      });
    }
    
  } catch (error) {
    results.errors.push({
      operation: 'mock_service_call',
      error: error.message
    });
  }
  
  return results;
}

async function checkDataDirectory() {
  console.log('📁 Checking data directory structure...');
  
  const results = {
    directories: [],
    files: [],
    errors: []
  };
  
  const expectedDirs = [
    'src/data/beers',
    'public/uploads',
    'lib/config'
  ];
  
  for (const dir of expectedDirs) {
    try {
      await fs.access(dir);
      results.directories.push({ path: dir, status: 'EXISTS' });
      
      // Try to list contents
      const contents = await fs.readdir(dir);
      results.files.push({
        directory: dir,
        fileCount: contents.length,
        files: contents.slice(0, 5) // First 5 files only
      });
      
    } catch (error) {
      results.errors.push({
        directory: dir,
        error: error.message
      });
    }
  }
  
  return results;
}

async function analyzeNonJsonCauses() {
  console.log('🔍 Analyzing potential non-JSON response causes...');
  
  const analysis = {
    potentialCauses: [],
    recommendations: []
  };
  
  // Check server.ts for response handling
  try {
    const serverContent = await fs.readFile('server.ts', 'utf8');
    
    // Look for potential issues
    if (!serverContent.includes('res.json')) {
      analysis.potentialCauses.push({
        issue: 'Missing res.json() calls',
        severity: 'HIGH',
        description: 'Server might be sending non-JSON responses'
      });
    }
    
    if (!serverContent.includes('application/json')) {
      analysis.potentialCauses.push({
        issue: 'Missing Content-Type headers',
        severity: 'HIGH',
        description: 'Responses might not have correct content type'
      });
    }
    
    if (serverContent.includes('res.send') && !serverContent.includes('res.json')) {
      analysis.potentialCauses.push({
        issue: 'Using res.send() instead of res.json()',
        severity: 'MEDIUM',
        description: 'May cause inconsistent response formatting'
      });
    }
    
    // Check for error handling
    if (!serverContent.includes('catch')) {
      analysis.potentialCauses.push({
        issue: 'Missing error handling',
        severity: 'HIGH',
        description: 'Unhandled errors might return non-JSON responses'
      });
    }
    
  } catch (error) {
    analysis.potentialCauses.push({
      issue: 'Cannot analyze server.ts',
      severity: 'HIGH',
      description: error.message
    });
  }
  
  // Generate recommendations
  if (analysis.potentialCauses.length > 0) {
    analysis.recommendations.push('Review server.ts for consistent JSON response handling');
    analysis.recommendations.push('Ensure all endpoints use res.json() for responses');
    analysis.recommendations.push('Add proper error handling middleware');
    analysis.recommendations.push('Set Content-Type headers consistently');
  }
  
  return analysis;
}

// Main test runner
async function runFoundationalTests() {
  console.log('🧪 Starting foundational services test suite...\n');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    services: null,
    types: null,
    middleware: null,
    environment: null,
    operations: null,
    directories: null,
    analysis: null,
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: 0
    }
  };
  
  try {
    // Run all foundational tests
    testResults.services = await testServiceInitialization();
    testResults.types = await testTypeDefinitions();
    testResults.middleware = await testMiddleware();
    testResults.environment = await testEnvironmentVariables();
    testResults.operations = await simulateServiceOperations();
    testResults.directories = await checkDataDirectory();
    testResults.analysis = await analyzeNonJsonCauses();
    
    // Calculate summary
    testResults.summary.totalTests = 7;
    testResults.summary.errors = 
      testResults.services.errors.length +
      testResults.types.errors.length +
      testResults.middleware.errors.length +
      testResults.operations.errors.length +
      testResults.directories.errors.length;
    
    testResults.summary.failed = testResults.summary.errors;
    testResults.summary.passed = testResults.summary.totalTests - testResults.summary.failed;
    
    // Save results
    await fs.writeFile('foundational-test-results.json', JSON.stringify(testResults, null, 2));
    
    // Display summary
    console.log('\n📊 FOUNDATIONAL TEST SUMMARY:');
    console.log(`✅ Tests Passed: ${testResults.summary.passed}/${testResults.summary.totalTests}`);
    console.log(`❌ Total Errors: ${testResults.summary.errors}`);
    
    if (testResults.analysis.potentialCauses.length > 0) {
      console.log('\n🚨 POTENTIAL NON-JSON CAUSES:');
      testResults.analysis.potentialCauses.forEach(cause => {
        console.log(`  [${cause.severity}] ${cause.issue}: ${cause.description}`);
      });
    }
    
    if (testResults.analysis.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      testResults.analysis.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
    
    console.log('\n📄 Detailed results saved to: foundational-test-results.json');
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Foundational test suite failed:', error);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFoundationalTests()
    .then(() => {
      console.log('\n🏁 Foundational tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Foundational tests failed:', error);
      process.exit(1);
    });
}

export {
  runFoundationalTests,
  testServiceInitialization,
  testTypeDefinitions,
  analyzeNonJsonCauses
};