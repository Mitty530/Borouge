#!/usr/bin/env node

/**
 * Script to format .env variables for easy copy-pasting into Vercel
 * Usage: node format-env-for-vercel.js
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE_PATH = path.join(__dirname, '../backend/.env');

function parseEnvFile(filePath) {
  try {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (line.trim() === '' || line.trim().startsWith('#')) {
        return;
      }
      
      // Parse KEY=VALUE format
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');
        envVars[key] = cleanValue;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error(`Error reading .env file: ${error.message}`);
    process.exit(1);
  }
}

function categorizeVariables(envVars) {
  const categories = {
    critical: [],
    ai: [],
    database: [],
    configuration: [],
    other: []
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    const keyUpper = key.toUpperCase();
    
    if (keyUpper.includes('SUPABASE')) {
      categories.database.push({ key, value, sensitive: keyUpper.includes('KEY') });
    } else if (keyUpper.includes('API_KEY')) {
      categories.ai.push({ key, value, sensitive: true });
    } else if (['NODE_ENV', 'PORT'].includes(key)) {
      categories.critical.push({ key, value, sensitive: false });
    } else if (keyUpper.includes('RATE_LIMIT') || keyUpper.includes('CACHE') || keyUpper.includes('URL') || keyUpper.includes('MODEL')) {
      categories.configuration.push({ key, value, sensitive: false });
    } else {
      categories.other.push({ key, value, sensitive: false });
    }
  });
  
  return categories;
}

function main() {
  console.log('🔧 Vercel Environment Variables Formatter');
  console.log('==========================================\n');
  
  if (!fs.existsSync(ENV_FILE_PATH)) {
    console.error(`❌ .env file not found at: ${ENV_FILE_PATH}`);
    process.exit(1);
  }
  
  const envVars = parseEnvFile(ENV_FILE_PATH);
  const categories = categorizeVariables(envVars);
  
  console.log('📋 Copy these variables to Vercel Environment Variables:\n');
  
  // Critical variables first
  if (categories.critical.length > 0) {
    console.log('🚨 CRITICAL VARIABLES (Add these first):');
    console.log('=' .repeat(50));
    categories.critical.forEach(({ key, value, sensitive }) => {
      console.log(`Key: ${key}`);
      console.log(`Value: ${value}`);
      console.log(`Sensitive: ${sensitive ? 'Yes' : 'No'}`);
      console.log('---');
    });
    console.log('');
  }
  
  // Database variables
  if (categories.database.length > 0) {
    console.log('🗄️  DATABASE VARIABLES:');
    console.log('=' .repeat(50));
    categories.database.forEach(({ key, value, sensitive }) => {
      console.log(`Key: ${key}`);
      console.log(`Value: ${value}`);
      console.log(`Sensitive: ${sensitive ? 'Yes' : 'No'}`);
      console.log('---');
    });
    console.log('');
  }
  
  // AI API variables
  if (categories.ai.length > 0) {
    console.log('🤖 AI API VARIABLES:');
    console.log('=' .repeat(50));
    categories.ai.forEach(({ key, value, sensitive }) => {
      console.log(`Key: ${key}`);
      console.log(`Value: ${value}`);
      console.log(`Sensitive: ${sensitive ? 'Yes' : 'No'}`);
      console.log('---');
    });
    console.log('');
  }
  
  // Configuration variables
  if (categories.configuration.length > 0) {
    console.log('⚙️  CONFIGURATION VARIABLES:');
    console.log('=' .repeat(50));
    categories.configuration.forEach(({ key, value, sensitive }) => {
      console.log(`Key: ${key}`);
      console.log(`Value: ${value}`);
      console.log(`Sensitive: ${sensitive ? 'Yes' : 'No'}`);
      console.log('---');
    });
    console.log('');
  }
  
  // Other variables
  if (categories.other.length > 0) {
    console.log('📦 OTHER VARIABLES:');
    console.log('=' .repeat(50));
    categories.other.forEach(({ key, value, sensitive }) => {
      console.log(`Key: ${key}`);
      console.log(`Value: ${value}`);
      console.log(`Sensitive: ${sensitive ? 'Yes' : 'No'}`);
      console.log('---');
    });
    console.log('');
  }
  
  console.log('📝 INSTRUCTIONS:');
  console.log('1. Go to your Vercel project → Settings → Environment Variables');
  console.log('2. For each variable above:');
  console.log('   - Click "Add New"');
  console.log('   - Copy the Key exactly as shown');
  console.log('   - Copy the Value exactly as shown');
  console.log('   - Set "Sensitive" toggle based on the indication above');
  console.log('   - Choose "All Environments" or specific environment');
  console.log('   - Click "Save"');
  console.log('3. Deploy your application after adding all variables');
  
  const totalVars = Object.keys(envVars).length;
  console.log(`\n✅ Total variables to add: ${totalVars}`);
}

main();
