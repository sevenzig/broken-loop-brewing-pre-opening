#!/usr/bin/env node
/**
 * Comprehensive Test Suite Runner
 * Runs all tests to investigate admin API non-JSON response issues
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const CONFIG = {
  serverStartTimeout: 15000,
  testTimeout: 30000,
  serverPort: 3001,
  maxRetries: 3
};

let serverProcess = null;
let testResults = {
  server: {
    started: false,
    error: null,
    logs: []
  },
  foundational: null,
  api: null,
  summary: {
    totalIssues: 0,
    nonJsonResponses: 0,
    criticalErrors: 0,
    recommendations: []
  }
};

function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  console.log(logMessage);
  testResults.server.logs.push(logMessage);
}

function startServer() {
  return new Promise((resolve, reject) => {
    log('Starting API server for testing...');
    
    // Try to start the server
    const startCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    serverProcess = spawn(startCommand, ['run', 'dev'], {
      cwd: 'api',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    let serverOutput = '';
    let errorOutput = '';
    let serverStarted = false;
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      
      // Check for server start indicators
      if (output.includes('server running') || 
          output.includes('listening') || 
          output.includes(`port ${CONFIG.serverPort}`)) {
        if (!serverStarted) {
          serverStarted = true;
          testResults.server.started = true;
          log('✅ Server started successfully');
          resolve();
        }
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      log(`Server stderr: ${data.toString()}`, 'WARN');
    });
    
    serverProcess.on('error', (error) => {
      testResults.server.error = error.message;
      log(`❌ Server process error: ${error.message}`, 'ERROR');
      reject(error);
    });
    
    serverProcess.on('exit', (code) => {
      if (code !== 0 && !serverStarted) {
        const error = new Error(`Server exited with code ${code}`);
        testResults.server.error = error.message;
        log(`❌ Server exited with code ${code}`, 'ERROR');
        reject(error);
      }
    });
    
    // Timeout for server start
    setTimeout(() => {
      if (!serverStarted) {
        const error = new Error('Server start timeout');
        testResults.server.error = error.message;
        log('❌ Server failed to start within timeout', 'ERROR');
        reject(error);
      }
    }, CONFIG.serverStartTimeout);
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (serverProcess) {
      log('Stopping API server...');
      
      serverProcess.kill('SIGTERM');
      
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
        resolve();
      }, 5000);
      
      serverProcess.on('exit', () => {
        log('✅ Server stopped');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

async function runFoundationalTests() {
  log('Running foundational services tests...');
  
  try {
    const { runFoundationalTests } = await import('./test-services-foundation.js');
    const results = await runFoundationalTests();
    testResults.foundational = results;
    log('✅ Foundational tests completed');
    return results;
  } catch (error) {
    log(`❌ Foundational tests failed: ${error.message}`, 'ERROR');
    testResults.foundational = { error: error.message };
    throw error;
  }
}

async function runApiTests() {
  log('Running API endpoint tests...');
  
  try {
    const { runAllTests } = await import('./test-admin-apis.js');
    const results = await runAllTests();
    testResults.api = results;
    log('✅ API tests completed');
    return results;
  } catch (error) {
    log(`❌ API tests failed: ${error.message}`, 'ERROR');
    testResults.api = { error: error.message };
    throw error;
  }
}

async function waitForServer() {
  const maxAttempts = 30;
  const delay = 1000;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const { makeRequest } = await import('./test-admin-apis.js');
      await makeRequest({
        hostname: 'localhost',
        port: CONFIG.serverPort,
        path: '/api/health',
        method: 'GET',
        timeout: 2000
      });
      log('✅ Server is responding');
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error('Server not responding after maximum attempts');
}

function analyzeCombinedResults() {
  log('Analyzing combined test results...');
  
  const analysis = {
    serverIssues: [],
    foundationalIssues: [],
    apiIssues: [],
    nonJsonCauses: [],
    recommendations: []
  };
  
  // Analyze server startup
  if (!testResults.server.started) {
    analysis.serverIssues.push({
      issue: 'Server failed to start',
      severity: 'CRITICAL',
      description: testResults.server.error || 'Unknown server error'
    });
  }
  
  // Analyze foundational results
  if (testResults.foundational && testResults.foundational.summary) {
    if (testResults.foundational.summary.errors > 0) {
      analysis.foundationalIssues.push({
        issue: 'Foundational service errors',
        severity: 'HIGH',
        count: testResults.foundational.summary.errors
      });
    }
    
    if (testResults.foundational.analysis && testResults.foundational.analysis.potentialCauses) {
      analysis.nonJsonCauses.push(...testResults.foundational.analysis.potentialCauses);
    }
  }
  
  // Analyze API results
  if (testResults.api && testResults.api.nonJsonResponses) {
    if (testResults.api.nonJsonResponses.count > 0) {
      analysis.apiIssues.push({
        issue: 'Non-JSON responses detected',
        severity: 'HIGH',
        count: testResults.api.nonJsonResponses.count,
        details: testResults.api.nonJsonResponses.details
      });
    }
  }
  
  // Generate recommendations
  if (analysis.serverIssues.length > 0) {
    analysis.recommendations.push('🚨 Fix server startup issues first - check dependencies and configuration');
  }
  
  if (analysis.nonJsonCauses.length > 0) {
    analysis.recommendations.push('🔧 Address foundational issues that may cause non-JSON responses');
  }
  
  if (analysis.apiIssues.length > 0) {
    analysis.recommendations.push('📝 Review API endpoint implementations for consistent JSON response handling');
  }
  
  // Calculate summary
  testResults.summary.totalIssues = 
    analysis.serverIssues.length + 
    analysis.foundationalIssues.length + 
    analysis.apiIssues.length;
  
  testResults.summary.nonJsonResponses = testResults.api ? 
    (testResults.api.nonJsonResponses ? testResults.api.nonJsonResponses.count : 0) : 0;
  
  testResults.summary.criticalErrors = analysis.serverIssues.filter(
    issue => issue.severity === 'CRITICAL'
  ).length;
  
  testResults.summary.recommendations = analysis.recommendations;
  
  return analysis;
}

async function generateFinalReport() {
  log('Generating comprehensive test report...');
  
  const analysis = analyzeCombinedResults();
  
  const report = {
    timestamp: new Date().toISOString(),
    testResults,
    analysis,
    executionInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      workingDirectory: process.cwd()
    }
  };
  
  // Save comprehensive report
  const reportPath = 'comprehensive-test-report.json';
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  // Generate markdown summary
  const markdownReport = `# Admin API Investigation Report

## Executive Summary
- **Total Issues Found**: ${testResults.summary.totalIssues}
- **Non-JSON Responses**: ${testResults.summary.nonJsonResponses}
- **Critical Errors**: ${testResults.summary.criticalErrors}
- **Server Started**: ${testResults.server.started ? '✅ Yes' : '❌ No'}

## Key Findings

### Server Issues
${analysis.serverIssues.map(issue => 
  `- **[${issue.severity}]** ${issue.issue}: ${issue.description}`
).join('\n')}

### Foundational Issues
${analysis.foundationalIssues.map(issue => 
  `- **[${issue.severity}]** ${issue.issue} (Count: ${issue.count || 'N/A'})`
).join('\n')}

### API Issues
${analysis.apiIssues.map(issue => 
  `- **[${issue.severity}]** ${issue.issue} (Count: ${issue.count || 'N/A'})`
).join('\n')}

## Non-JSON Response Causes
${analysis.nonJsonCauses.map(cause => 
  `- **[${cause.severity}]** ${cause.issue}: ${cause.description}`
).join('\n')}

## Recommendations
${testResults.summary.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps
1. Review the detailed JSON report at: \`api/comprehensive-test-report.json\`
2. Address critical server startup issues first
3. Fix foundational service dependencies
4. Implement consistent JSON response handling
5. Add proper error handling middleware

Generated on: ${new Date().toISOString()}
`;
  
  const markdownPath = 'TEST_INVESTIGATION_REPORT.md';
  await fs.writeFile(markdownPath, markdownReport);
  
  return { report, analysis, markdownPath, reportPath };
}

async function runComprehensiveTests() {
  console.log('🧪 Starting comprehensive admin API investigation...\n');
  
  try {
    // Step 1: Run foundational tests (no server required)
    log('=== STEP 1: FOUNDATIONAL TESTS ===');
    await runFoundationalTests();
    
    // Step 2: Start server
    log('\n=== STEP 2: SERVER STARTUP ===');
    try {
      await startServer();
      
      // Wait for server to be ready
      await waitForServer();
      
      // Step 3: Run API tests
      log('\n=== STEP 3: API ENDPOINT TESTS ===');
      await runApiTests();
      
    } catch (serverError) {
      log(`❌ Server-related error: ${serverError.message}`, 'ERROR');
      // Continue with analysis even if server fails
    }
    
    // Step 4: Generate comprehensive report
    log('\n=== STEP 4: GENERATING REPORT ===');
    const { report, analysis, markdownPath, reportPath } = await generateFinalReport();
    
    // Display results
    console.log('\n📊 COMPREHENSIVE TEST RESULTS:');
    console.log(`🚀 Server Started: ${testResults.server.started ? '✅ Yes' : '❌ No'}`);
    console.log(`⚠️  Total Issues: ${testResults.summary.totalIssues}`);
    console.log(`🚫 Non-JSON Responses: ${testResults.summary.nonJsonResponses}`);
    console.log(`🚨 Critical Errors: ${testResults.summary.criticalErrors}`);
    
    if (testResults.summary.recommendations.length > 0) {
      console.log('\n💡 KEY RECOMMENDATIONS:');
      testResults.summary.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    console.log(`\n📄 Reports generated:`);
    console.log(`   • Detailed JSON: ${reportPath}`);
    console.log(`   • Summary Markdown: ${markdownPath}`);
    
    return report;
    
  } catch (error) {
    log(`❌ Comprehensive test execution failed: ${error.message}`, 'ERROR');
    throw error;
  } finally {
    // Always try to stop the server
    await stopServer();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  log('🛑 Received SIGINT, shutting down...');
  await stopServer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('🛑 Received SIGTERM, shutting down...');
  await stopServer();
  process.exit(0);
});

// Execute comprehensive tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests()
    .then(() => {
      console.log('\n🏁 Comprehensive investigation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Investigation failed:', error.message);
      process.exit(1);
    });
}

export {
  runComprehensiveTests,
  startServer,
  stopServer,
  CONFIG
};