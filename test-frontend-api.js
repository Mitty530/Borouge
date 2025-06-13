#!/usr/bin/env node

/**
 * Test script to verify frontend can make API calls to backend
 * This simulates what the frontend does when a user searches
 */

const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3001';

async function testFrontendAPICall() {
  console.log('🔍 Testing Frontend → Backend API Call');
  console.log('=====================================\n');
  
  try {
    console.log('📤 Simulating frontend ESG Intelligence search...');
    
    // This is exactly what the frontend esgIntelligenceService does
    const response = await fetch(`${BACKEND_URL}/api/esg-intelligence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      body: JSON.stringify({ 
        query: 'carbon emissions reduction strategies' 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('✅ ESG Intelligence API Call: SUCCESS');
      console.log(`   - Query: "${data.query}"`);
      console.log(`   - Response time: ${data.responseTime}ms`);
      console.log(`   - Cached: ${data.cached}`);
      console.log(`   - Response length: ${data.response?.length || 0} characters`);
      console.log(`   - Request ID: ${data.requestId}`);
      
      // Test Smart Search as well
      console.log('\n📤 Testing Smart Search API...');
      
      const smartResponse = await fetch(`${BACKEND_URL}/api/esg-smart-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': `smart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify({ 
          query: 'renewable energy transition petrochemical industry' 
        }),
      });

      const smartData = await smartResponse.json();
      
      if (smartData.success) {
        console.log('✅ Smart Search API Call: SUCCESS');
        console.log(`   - Query: "${smartData.query}"`);
        console.log(`   - Response time: ${smartData.responseTime}ms`);
        console.log(`   - Articles found: ${smartData.articles?.length || 0}`);
        console.log(`   - Cached: ${smartData.cached}`);
      } else {
        console.log('❌ Smart Search API Call: FAILED');
        console.log(`   - Error: ${smartData.error?.message}`);
      }
      
      console.log('\n🎉 FRONTEND-BACKEND CONNECTION WORKING!');
      console.log('The frontend can successfully communicate with the backend.');
      console.log('Users should be able to search and get results.');
      
    } else {
      console.log('❌ ESG Intelligence API Call: FAILED');
      console.log(`   - Error: ${data.error?.message}`);
    }
    
  } catch (error) {
    console.log('❌ API Call Failed');
    console.log(`   - Error: ${error.message}`);
    console.log('\nThis means the frontend cannot reach the backend.');
    console.log('Check that both services are running on the correct ports.');
  }
}

// Run the test
testFrontendAPICall().catch(console.error);
