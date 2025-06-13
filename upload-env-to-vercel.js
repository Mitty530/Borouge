#!/usr/bin/env node

/**
 * Script to help upload environment variables to Vercel
 * This script reads the vercel.env file and provides instructions
 */

const fs = require('fs');
const path = require('path');

function parseEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const envVars = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        envVars[key.trim()] = value.trim();
      }
    }
    
    return envVars;
  } catch (error) {
    console.error('Error reading env file:', error.message);
    return {};
  }
}

function main() {
  console.log('🔧 Vercel Environment Variables Upload Helper');
  console.log('============================================\n');
  
  const envFilePath = path.join(__dirname, 'vercel.env');
  
  if (!fs.existsSync(envFilePath)) {
    console.error('❌ vercel.env file not found!');
    console.log('Please make sure vercel.env exists in the project root.');
    process.exit(1);
  }
  
  const envVars = parseEnvFile(envFilePath);
  const envCount = Object.keys(envVars).length;
  
  if (envCount === 0) {
    console.error('❌ No environment variables found in vercel.env');
    process.exit(1);
  }
  
  console.log(`📋 Found ${envCount} environment variables in vercel.env\n`);
  
  console.log('🚀 OPTION 1: Upload via Vercel CLI (Recommended)');
  console.log('===============================================');
  console.log('1. Install Vercel CLI: npm i -g vercel');
  console.log('2. Login to Vercel: vercel login');
  console.log('3. Link project: vercel link');
  console.log('4. Upload env vars: vercel env pull .env.local');
  console.log('5. Then run: vercel env add < vercel.env\n');
  
  console.log('🌐 OPTION 2: Upload via Vercel Dashboard');
  console.log('========================================');
  console.log('1. Go to: https://vercel.com/dashboard');
  console.log('2. Select your project: borouge');
  console.log('3. Go to Settings > Environment Variables');
  console.log('4. Click "Add New" and copy-paste each variable:\n');
  
  // Display variables for manual copying
  console.log('📝 Environment Variables to Add:');
  console.log('================================');
  
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('\n✅ After uploading, redeploy your project:');
  console.log('   - Via CLI: vercel --prod');
  console.log('   - Via Dashboard: Go to Deployments > Redeploy\n');
  
  console.log('🔍 Critical Variables to Verify:');
  console.log('=================================');
  const criticalVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY', 
    'GEMINI_API_KEY',
    'GNEWS_API_KEY'
  ];
  
  criticalVars.forEach(varName => {
    const status = envVars[varName] ? '✅ SET' : '❌ MISSING';
    console.log(`${varName}: ${status}`);
  });
  
  console.log('\n🎯 Next Steps:');
  console.log('==============');
  console.log('1. Upload environment variables using one of the options above');
  console.log('2. Redeploy the project');
  console.log('3. Test the API endpoints');
  console.log('4. Check deployment logs if issues persist\n');
}

if (require.main === module) {
  main();
}

module.exports = { parseEnvFile };
