// Frontend-Backend Integration Test
// Tests the complete data flow from frontend to backend

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testBackendHealth() {
  console.log('🏥 Testing backend health...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (data.success && data.status === 'healthy') {
      console.log('✅ Backend health check passed');
      console.log(`   - Database: ${data.services.database.status}`);
      console.log(`   - AI Engines: ${Object.keys(data.services.aiEngines.configuration).join(', ')}`);
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend health check error:', error.message);
    return false;
  }
}

async function testESGIntelligenceAPI() {
  console.log('🔍 Testing ESG Intelligence API...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/esg-intelligence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'EU plastic regulations 2024' }),
    });

    const data = await response.json();
    
    if (data.success && data.response) {
      console.log('✅ ESG Intelligence API test passed');
      console.log(`   - Response time: ${data.responseTime}ms`);
      console.log(`   - Cached: ${data.cached}`);
      console.log(`   - Response length: ${data.response.length} characters`);
      return true;
    } else {
      console.log('❌ ESG Intelligence API test failed');
      console.log('   - Response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ ESG Intelligence API error:', error.message);
    return false;
  }
}

async function testSmartSearchAPI() {
  console.log('🔍 Testing Smart Search API...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/esg-smart-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'carbon emissions petrochemical' }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Smart Search API test passed');
      console.log(`   - Articles found: ${data.articles?.length || 0}`);
      console.log(`   - Processing time: ${data.processingTime || data.metadata?.processingTime}ms`);
      console.log(`   - Has executive summary: ${!!data.comprehensiveExecutiveSummary}`);
      return true;
    } else {
      console.log('❌ Smart Search API test failed');
      console.log('   - Response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Smart Search API error:', error.message);
    return false;
  }
}

async function testFrontendServiceIntegration() {
  console.log('🔗 Testing frontend service integration...');
  
  // Import the frontend service
  const { esgIntelligenceService } = require('./src/services/esgIntelligenceService.js');
  
  try {
    // Test health check
    const healthResult = await esgIntelligenceService.checkHealth();
    if (healthResult.success) {
      console.log('✅ Frontend health check service working');
    } else {
      console.log('❌ Frontend health check service failed');
      return false;
    }

    // Test query analysis
    const queryResult = await esgIntelligenceService.analyzeQuery('EU plastic regulations');
    if (queryResult.success && queryResult.response) {
      console.log('✅ Frontend query service working');
      console.log(`   - Response time: ${queryResult.responseTime}ms`);
      console.log(`   - Response length: ${queryResult.response.length} characters`);
      return true;
    } else {
      console.log('❌ Frontend query service failed');
      console.log('   - Result:', queryResult);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend service integration error:', error.message);
    return false;
  }
}

async function runIntegrationTests() {
  console.log('🚀 Starting Frontend-Backend Integration Tests');
  console.log('='.repeat(50));

  const tests = [
    { name: 'Backend Health', test: testBackendHealth },
    { name: 'ESG Intelligence API', test: testESGIntelligenceAPI },
    { name: 'Smart Search API', test: testSmartSearchAPI },
    { name: 'Frontend Service Integration', test: testFrontendServiceIntegration }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    console.log(`\n📋 Running: ${name}`);
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Integration Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All integration tests passed! Frontend-Backend connectivity is working perfectly.');
  } else {
    console.log('\n⚠️  Some integration tests failed. Please check the issues above.');
  }

  return failed === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = { runIntegrationTests };
