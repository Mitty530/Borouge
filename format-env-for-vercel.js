#!/usr/bin/env node

/**
 * Format Environment Variables for Vercel
 * Reads the vercel.env file and formats it for easy copy-paste into Vercel dashboard
 */

const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, 'vercel.env');

console.log('🔧 Formatting Environment Variables for Vercel Dashboard');
console.log('=' .repeat(60));

try {
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  const lines = envContent.split('\n');
  
  const variables = [];
  
  lines.forEach(line => {
    // Skip comments and empty lines
    if (line.trim() && !line.trim().startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('='); // Handle values with = signs
        variables.push({ key: key.trim(), value: value.trim() });
      }
    }
  });

  console.log(`Found ${variables.length} environment variables:\n`);

  // Format for Vercel dashboard
  console.log('📋 COPY-PASTE FORMAT FOR VERCEL DASHBOARD:');
  console.log('-'.repeat(50));
  
  variables.forEach(({ key, value }) => {
    console.log(`${key}=${value}`);
  });

  console.log('\n📝 INDIVIDUAL VARIABLES (for manual entry):');
  console.log('-'.repeat(50));
  
  variables.forEach(({ key, value }, index) => {
    console.log(`${index + 1}. Key: ${key}`);
    console.log(`   Value: ${value}`);
    console.log('');
  });

  console.log('🎯 INSTRUCTIONS:');
  console.log('1. Go to your Vercel project dashboard');
  console.log('2. Navigate to Settings → Environment Variables');
  console.log('3. Option A: Click "Import .env" and upload vercel.env file');
  console.log('4. Option B: Copy-paste the variables above one by one');
  console.log('5. Make sure to set them for "Production" environment');
  console.log('6. Redeploy your application after adding variables');

} catch (error) {
  console.error('❌ Error reading vercel.env file:', error.message);
  console.log('\n💡 Make sure the vercel.env file exists in the project root');
  process.exit(1);
}
