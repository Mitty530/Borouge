#!/usr/bin/env node

/**
 * Test script to verify frontend-backend connection
 * This script tests the API endpoints that the frontend uses
 */

const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

async function testBackendDirect() {
  console.log('🔍 Testing direct backend connection...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.success) {
      console.log('✅ Backend health check: PASSED');
      console.log(`   - Status: ${healthData.status}`);
      console.log(`   - Uptime: ${Math.round(healthData.uptime)}s`);
    } else {
      console.log('❌ Backend health check: FAILED');
      return false;
    }
    
    // Test ESG Intelligence API
    const esgResponse = await fetch(`${BACKEND_URL}/api/esg-intelligence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'carbon emissions reduction strategies' })
    });
    
    const esgData = await esgResponse.json();
    
    if (esgData.success) {
      console.log('✅ ESG Intelligence API: PASSED');
      console.log(`   - Response time: ${esgData.responseTime}ms`);
      console.log(`   - Cached: ${esgData.cached}`);
    } else {
      console.log('❌ ESG Intelligence API: FAILED');
      console.log(`   - Error: ${esgData.error?.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ Backend connection: FAILED');
    console.log(`   - Error: ${error.message}`);
    return false;
  }
}

async function testFrontendProxy() {
  console.log('\n🔍 Testing frontend proxy connection...');
  
  try {
    // Test if frontend can reach backend through proxy
    const proxyResponse = await fetch(`${FRONTEND_URL}/health`);
    const proxyData = await proxyResponse.json();
    
    if (proxyData.success) {
      console.log('✅ Frontend proxy: PASSED');
      console.log('   - Frontend can reach backend through proxy');
    } else {
      console.log('❌ Frontend proxy: FAILED');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ Frontend proxy: FAILED');
    console.log(`   - Error: ${error.message}`);
    console.log('   - This means the React proxy is not working');
    return false;
  }
}

async function testFrontendAccess() {
  console.log('\n🔍 Testing frontend accessibility...');
  
  try {
    const frontendResponse = await fetch(FRONTEND_URL);
    
    if (frontendResponse.ok) {
      console.log('✅ Frontend accessible: PASSED');
      console.log(`   - Status: ${frontendResponse.status}`);
    } else {
      console.log('❌ Frontend accessible: FAILED');
      console.log(`   - Status: ${frontendResponse.status}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ Frontend accessible: FAILED');
    console.log(`   - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Borouge ESG Platform Connection Test');
  console.log('=====================================\n');
  
  const backendTest = await testBackendDirect();
  const frontendTest = await testFrontendAccess();
  const proxyTest = await testFrontendProxy();
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Backend Direct:    ${backendTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Access:   ${frontendTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Proxy:    ${proxyTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (backendTest && frontendTest && proxyTest) {
    console.log('\n🎉 ALL TESTS PASSED! Frontend-Backend connection is working.');
  } else if (backendTest && frontendTest && !proxyTest) {
    console.log('\n⚠️  PROXY ISSUE: Backend and frontend are running, but proxy is not working.');
    console.log('   This means users need to access the backend directly or the proxy needs fixing.');
  } else {
    console.log('\n❌ TESTS FAILED: There are connection issues that need to be resolved.');
  }
  
  console.log('\n🔗 URLs:');
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log(`   Backend:  ${BACKEND_URL}`);
  console.log(`   API:      ${BACKEND_URL}/api/esg-intelligence`);
}

// Run the tests
runTests().catch(console.error);
