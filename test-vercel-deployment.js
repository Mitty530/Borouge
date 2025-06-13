#!/usr/bin/env node

/**
 * Vercel Deployment Test Script
 * Tests all API endpoints after deployment to ensure everything works correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:3000'; // Pass your Vercel URL as argument
const TIMEOUT = 30000; // 30 seconds timeout

console.log('🧪 Testing Borouge ESG Intelligence Platform Deployment');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log('=' .repeat(60));

// Test utilities
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Borouge-ESG-Test-Client/1.0',
        ...options.headers
      },
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('🏥 Testing Health Endpoint...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Health check passed');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Services: ${Object.keys(response.data.services || {}).join(', ')}`);
      return true;
    } else {
      console.log('❌ Health check failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testSuggestedQueries() {
  console.log('📝 Testing Suggested Queries Endpoint...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/suggested-queries`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Suggested queries retrieved');
      console.log(`   Count: ${response.data.queries?.length || 0}`);
      console.log(`   Sample: ${response.data.queries?.[0] || 'None'}`);
      return true;
    } else {
      console.log('❌ Suggested queries failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Suggested queries error:', error.message);
    return false;
  }
}

async function testESGIntelligence() {
  console.log('🧠 Testing ESG Intelligence Endpoint...');
  
  const testQuery = 'EU plastic waste regulations 2024';
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/esg-intelligence`, {
      method: 'POST',
      body: { query: testQuery }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ ESG Intelligence analysis completed');
      console.log(`   Query: ${response.data.query}`);
      console.log(`   Response time: ${response.data.responseTime}ms`);
      console.log(`   Analysis length: ${response.data.response?.length || 0} characters`);
      return true;
    } else {
      console.log('❌ ESG Intelligence failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ ESG Intelligence error:', error.message);
    return false;
  }
}

async function testFrontendAccess() {
  console.log('🌐 Testing Frontend Access...');
  
  try {
    const response = await makeRequest(BASE_URL);
    
    if (response.status === 200) {
      console.log('✅ Frontend accessible');
      console.log(`   Content type: ${response.headers['content-type'] || 'Unknown'}`);
      return true;
    } else {
      console.log('❌ Frontend access failed');
      console.log(`   Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend access error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  const tests = [
    { name: 'Frontend Access', fn: testFrontendAccess },
    { name: 'Health Check', fn: testHealthEndpoint },
    { name: 'Suggested Queries', fn: testSuggestedQueries },
    { name: 'ESG Intelligence', fn: testESGIntelligence }
  ];

  const results = [];
  
  for (const test of tests) {
    console.log(`\n🔄 Running ${test.name}...`);
    const startTime = Date.now();
    
    try {
      const success = await test.fn();
      const duration = Date.now() - startTime;
      
      results.push({
        name: test.name,
        success,
        duration
      });
      
      console.log(`   Duration: ${duration}ms`);
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      results.push({
        name: test.name,
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name} (${result.duration}ms)`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Deployment is successful.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the deployment.');
    process.exit(1);
  }
}

// Usage instructions
if (process.argv.length < 3) {
  console.log('Usage: node test-vercel-deployment.js <YOUR_VERCEL_URL>');
  console.log('Example: node test-vercel-deployment.js https://your-app.vercel.app');
  console.log('\nFor local testing: node test-vercel-deployment.js http://localhost:3000');
  process.exit(1);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
