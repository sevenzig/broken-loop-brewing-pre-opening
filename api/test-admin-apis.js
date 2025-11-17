/**
 * Comprehensive Test Suite for Admin APIs - Non-JSON Response Investigation
 * Tests all admin API endpoints and foundational functions to identify non-JSON response causes
 */

import http from 'http';
import fs from 'fs/promises';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  serverHost: 'localhost',
  serverPort: 3001,
  testTimeout: 10000,
  verbose: true
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  nonJsonResponses: [],
  foundationalIssues: []
};

// Utility functions
function log(message, type = 'INFO') {
  if (TEST_CONFIG.verbose) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          rawResponse: res
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(TEST_CONFIG.testTimeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function analyzeResponse(response, testName) {
  const analysis = {
    testName,
    statusCode: response.statusCode,
    contentType: response.headers['content-type'],
    isJson: false,
    jsonValid: false,
    responseSize: response.body.length,
    issues: []
  };
  
  // Check content type
  if (!response.headers['content-type'] || !response.headers['content-type'].includes('application/json')) {
    analysis.issues.push(`Content-Type is not application/json: ${response.headers['content-type']}`);
  }
  
  // Check if response is JSON
  if (isValidJSON(response.body)) {
    analysis.isJson = true;
    analysis.jsonValid = true;
    try {
      analysis.parsedBody = JSON.parse(response.body);
    } catch (e) {
      analysis.issues.push(`JSON parsing failed: ${e.message}`);
    }
  } else {
    analysis.issues.push('Response body is not valid JSON');
    analysis.responsePreview = response.body.substring(0, 200);
  }
  
  return analysis;
}

// Test functions
async function testServerHealth() {
  log('Testing server health endpoint...');
  
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.serverHost,
      port: TEST_CONFIG.serverPort,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const analysis = analyzeResponse(response, 'Server Health');
    
    if (response.statusCode === 200 && analysis.isJson) {
      log('✅ Health endpoint working correctly');
      testResults.passed++;
    } else {
      log('❌ Health endpoint failed');
      testResults.failed++;
      testResults.errors.push(analysis);
    }
    
    return analysis;
  } catch (error) {
    log(`❌ Health endpoint error: ${error.message}`, 'ERROR');
    testResults.failed++;
    testResults.foundationalIssues.push({
      test: 'Server Health',
      error: error.message,
      type: 'connectivity'
    });
    return null;
  }
}

async function testAdminBeersEndpoint() {
  log('Testing admin beers endpoint...');
  
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.serverHost,
      port: TEST_CONFIG.serverPort,
      path: '/api/admin/beers',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    const analysis = analyzeResponse(response, 'Admin Beers');
    
    if (!analysis.isJson) {
      testResults.nonJsonResponses.push(analysis);
      log('❌ Admin beers endpoint returned non-JSON response');
    }
    
    if (response.statusCode === 200 && analysis.isJson) {
      log('✅ Admin beers endpoint working correctly');
      testResults.passed++;
    } else {
      log(`❌ Admin beers endpoint failed (Status: ${response.statusCode})`);
      testResults.failed++;
      testResults.errors.push(analysis);
    }
    
    return analysis;
  } catch (error) {
    log(`❌ Admin beers endpoint error: ${error.message}`, 'ERROR');
    testResults.failed++;
    testResults.foundationalIssues.push({
      test: 'Admin Beers',
      error: error.message,
      type: 'endpoint_failure'
    });
    return null;
  }
}

async function testAdminMetadataEndpoint() {
  log('Testing admin metadata endpoint...');
  
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.serverHost,
      port: TEST_CONFIG.serverPort,
      path: '/api/admin/metadata-simple',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    const analysis = analyzeResponse(response, 'Admin Metadata');
    
    if (!analysis.isJson) {
      testResults.nonJsonResponses.push(analysis);
      log('❌ Admin metadata endpoint returned non-JSON response');
    }
    
    if (response.statusCode === 200 && analysis.isJson) {
      log('✅ Admin metadata endpoint working correctly');
      testResults.passed++;
    } else {
      log(`❌ Admin metadata endpoint failed (Status: ${response.statusCode})`);
      testResults.failed++;
      testResults.errors.push(analysis);
    }
    
    return analysis;
  } catch (error) {
    log(`❌ Admin metadata endpoint error: ${error.message}`, 'ERROR');
    testResults.failed++;
    testResults.foundationalIssues.push({
      test: 'Admin Metadata',
      error: error.message,
      type: 'endpoint_failure'
    });
    return null;
  }
}

async function testPublicBeersEndpoint() {
  log('Testing public beers endpoint...');
  
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.serverHost,
      port: TEST_CONFIG.serverPort,
      path: '/api/beers',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const analysis = analyzeResponse(response, 'Public Beers');
    
    if (!analysis.isJson) {
      testResults.nonJsonResponses.push(analysis);
      log('❌ Public beers endpoint returned non-JSON response');
    }
    
    if (response.statusCode === 200 && analysis.isJson) {
      log('✅ Public beers endpoint working correctly');
      testResults.passed++;
    } else {
      log(`❌ Public beers endpoint failed (Status: ${response.statusCode})`);
      testResults.failed++;
      testResults.errors.push(analysis);
    }
    
    return analysis;
  } catch (error) {
    log(`❌ Public beers endpoint error: ${error.message}`, 'ERROR');
    testResults.failed++;
    testResults.foundationalIssues.push({
      test: 'Public Beers',
      error: error.message,
      type: 'endpoint_failure'
    });
    return null;
  }
}

async function testBusinessStatusEndpoint() {
  log('Testing business status endpoint...');
  
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.serverHost,
      port: TEST_CONFIG.serverPort,
      path: '/api/business-status',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const analysis = analyzeResponse(response, 'Business Status');
    
    if (!analysis.isJson) {
      testResults.nonJsonResponses.push(analysis);
      log('❌ Business status endpoint returned non-JSON response');
    }
    
    if (response.statusCode === 200 && analysis.isJson) {
      log('✅ Business status endpoint working correctly');
      testResults.passed++;
    } else {
      log(`❌ Business status endpoint failed (Status: ${response.statusCode})`);
      testResults.failed++;
      testResults.errors.push(analysis);
    }
    
    return analysis;
  } catch (error) {
    log(`❌ Business status endpoint error: ${error.message}`, 'ERROR');
    testResults.failed++;
    testResults.foundationalIssues.push({
      test: 'Business Status',
      error: error.message,
      type: 'endpoint_failure'
    });
    return null;
  }
}

async function testFoundationalServices() {
  log('Testing foundational services and dependencies...');
  
  const foundationalTests = [];
  
  // Test file system access
  try {
    await fs.access('api/lib', fs.constants.F_OK);
    foundationalTests.push({ test: 'File system access', status: 'PASS' });
  } catch (error) {
    foundationalTests.push({ 
      test: 'File system access', 
      status: 'FAIL', 
      error: error.message 
    });
    testResults.foundationalIssues.push({
      test: 'File System Access',
      error: error.message,
      type: 'file_system'
    });
  }
  
  // Test service file existence
  const serviceFiles = [
    'api/lib/services/AdminService.ts',
    'api/lib/services/BeerService.ts',
    'api/lib/services/GitHubService.ts',
    'api/lib/services/FileService.ts'
  ];
  
  for (const file of serviceFiles) {
    try {
      await fs.access(file, fs.constants.F_OK);
      foundationalTests.push({ test: `Service file: ${file}`, status: 'PASS' });
    } catch (error) {
      foundationalTests.push({ 
        test: `Service file: ${file}`, 
        status: 'FAIL', 
        error: error.message 
      });
      testResults.foundationalIssues.push({
        test: `Service File: ${file}`,
        error: error.message,
        type: 'missing_dependency'
      });
    }
  }
  
  // Test package.json and dependencies
  try {
    const packageJson = await fs.readFile('api/package.json', 'utf8');
    const packageData = JSON.parse(packageJson);
    foundationalTests.push({ 
      test: 'Package.json valid', 
      status: 'PASS',
      dependencies: Object.keys(packageData.dependencies || {}).length
    });
  } catch (error) {
    foundationalTests.push({ 
      test: 'Package.json valid', 
      status: 'FAIL', 
      error: error.message 
    });
    testResults.foundationalIssues.push({
      test: 'Package.json validation',
      error: error.message,
      type: 'configuration'
    });
  }
  
  return foundationalTests;
}

async function testErrorHandling() {
  log('Testing error handling and edge cases...');
  
  const errorTests = [];
  
  // Test invalid endpoint
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.serverHost,
      port: TEST_CONFIG.serverPort,
      path: '/api/nonexistent',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const analysis = analyzeResponse(response, 'Invalid Endpoint');
    errorTests.push({
      test: 'Invalid endpoint handling',
      status: response.statusCode === 404 ? 'PASS' : 'FAIL',
      expectedStatus: 404,
      actualStatus: response.statusCode,
      isJson: analysis.isJson
    });
    
    if (!analysis.isJson && response.statusCode === 404) {
      testResults.nonJsonResponses.push(analysis);
    }
    
  } catch (error) {
    errorTests.push({
      test: 'Invalid endpoint handling',
      status: 'ERROR',
      error: error.message
    });
  }
  
  // Test malformed requests
  try {
    const response = await makeRequest({
      hostname: TEST_CONFIG.serverHost,
      port: TEST_CONFIG.serverPort,
      path: '/api/admin/beers',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: 'invalid-json'
    });
    
    const analysis = analyzeResponse(response, 'Malformed Request');
    errorTests.push({
      test: 'Malformed request handling',
      status: response.statusCode >= 400 ? 'PASS' : 'FAIL',
      actualStatus: response.statusCode,
      isJson: analysis.isJson
    });
    
    if (!analysis.isJson) {
      testResults.nonJsonResponses.push(analysis);
    }
    
  } catch (error) {
    errorTests.push({
      test: 'Malformed request handling',
      status: 'ERROR',
      error: error.message
    });
  }
  
  return errorTests;
}

async function generateDetailedReport() {
  log('Generating detailed test report...');
  
  const report = {
    summary: {
      totalTests: testResults.passed + testResults.failed,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: `${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`
    },
    nonJsonResponses: {
      count: testResults.nonJsonResponses.length,
      details: testResults.nonJsonResponses
    },
    foundationalIssues: {
      count: testResults.foundationalIssues.length,
      details: testResults.foundationalIssues
    },
    errors: testResults.errors,
    timestamp: new Date().toISOString(),
    recommendations: []
  };
  
  // Generate recommendations based on findings
  if (testResults.nonJsonResponses.length > 0) {
    report.recommendations.push('🔍 Non-JSON responses detected - check middleware and error handling');
  }
  
  if (testResults.foundationalIssues.length > 0) {
    report.recommendations.push('⚠️  Foundational issues found - check service dependencies and configurations');
  }
  
  if (testResults.failed > testResults.passed) {
    report.recommendations.push('🚨 More tests failing than passing - check server startup and initialization');
  }
  
  // Save report to file
  const reportPath = 'admin-api-test-report.json';
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

// Main test execution
async function runAllTests() {
  console.log('🧪 Starting comprehensive admin API investigation...\n');
  
  try {
    // Test foundational services first
    log('=== FOUNDATIONAL TESTS ===');
    const foundationalResults = await testFoundationalServices();
    console.log('Foundational test results:', foundationalResults);
    
    // Test server connectivity
    log('\n=== CONNECTIVITY TESTS ===');
    await testServerHealth();
    
    // Test all admin endpoints
    log('\n=== ADMIN API TESTS ===');
    await testAdminBeersEndpoint();
    await testAdminMetadataEndpoint();
    
    // Test public endpoints for comparison
    log('\n=== PUBLIC API TESTS ===');
    await testPublicBeersEndpoint();
    await testBusinessStatusEndpoint();
    
    // Test error handling
    log('\n=== ERROR HANDLING TESTS ===');
    const errorResults = await testErrorHandling();
    console.log('Error handling results:', errorResults);
    
    // Generate comprehensive report
    log('\n=== GENERATING REPORT ===');
    const report = await generateDetailedReport();
    
    // Display final results
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}`);
    console.log(`🚫 Non-JSON Responses: ${report.nonJsonResponses.count}`);
    console.log(`⚠️  Foundational Issues: ${report.foundationalIssues.count}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    console.log(`\n📄 Detailed report saved to: admin-api-test-report.json`);
    
    if (report.nonJsonResponses.count > 0) {
      console.log('\n🔍 NON-JSON RESPONSE ANALYSIS:');
      report.nonJsonResponses.details.forEach(response => {
        console.log(`\n  Test: ${response.testName}`);
        console.log(`  Status: ${response.statusCode}`);
        console.log(`  Content-Type: ${response.contentType}`);
        console.log(`  Issues: ${response.issues.join(', ')}`);
        if (response.responsePreview) {
          console.log(`  Preview: ${response.responsePreview}...`);
        }
      });
    }
    
    return report;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(() => {
      console.log('\n🏁 Test suite completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    });
}

export {
  runAllTests,
  testResults,
  TEST_CONFIG,
  makeRequest
};