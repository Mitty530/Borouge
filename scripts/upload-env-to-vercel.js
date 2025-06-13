#!/usr/bin/env node

/**
 * Script to upload environment variables from .env file to Vercel
 * Usage: node upload-env-to-vercel.js
 * 
 * Prerequisites:
 * 1. Install Vercel CLI: npm i -g vercel
 * 2. Login to Vercel: vercel login
 * 3. Link your project: vercel link
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ENV_FILE_PATH = path.join(__dirname, '../backend/.env');
const PROJECT_NAME = 'borouge-esg'; // Replace with your Vercel project name

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

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
    log(`Error reading .env file: ${error.message}`, 'red');
    process.exit(1);
  }
}

function addEnvVarToVercel(key, value, target = 'production') {
  try {
    // Determine if variable should be sensitive
    const sensitiveKeys = [
      'API_KEY', 'SECRET', 'PASSWORD', 'TOKEN', 'PRIVATE',
      'GROQ_API_KEY', 'GEMINI_API_KEY', 'GNEWS_API_KEY', 'OPENAI_API_KEY',
      'SUPABASE_ANON_KEY'
    ];
    
    const isSensitive = sensitiveKeys.some(sensitiveKey => 
      key.toUpperCase().includes(sensitiveKey)
    );
    
    // Build Vercel CLI command
    let command = `vercel env add ${key} ${target}`;
    
    log(`Adding ${key} to Vercel (${isSensitive ? 'sensitive' : 'public'})...`, 'blue');
    
    // Execute command with value as input
    execSync(command, {
      input: value,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    log(`✅ Successfully added ${key}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to add ${key}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Starting Vercel Environment Variables Upload', 'blue');
  log('================================================', 'blue');
  
  // Check if .env file exists
  if (!fs.existsSync(ENV_FILE_PATH)) {
    log(`❌ .env file not found at: ${ENV_FILE_PATH}`, 'red');
    log('Please ensure the .env file exists in the backend directory.', 'yellow');
    process.exit(1);
  }
  
  // Parse environment variables
  log('📖 Reading environment variables from .env file...', 'blue');
  const envVars = parseEnvFile(ENV_FILE_PATH);
  
  const totalVars = Object.keys(envVars).length;
  log(`Found ${totalVars} environment variables`, 'green');
  
  if (totalVars === 0) {
    log('No environment variables found in .env file', 'yellow');
    process.exit(0);
  }
  
  // Display variables to be uploaded
  log('\n📋 Variables to upload:', 'blue');
  Object.keys(envVars).forEach(key => {
    const value = envVars[key];
    const displayValue = key.includes('API_KEY') || key.includes('SECRET') 
      ? '***HIDDEN***' 
      : value.length > 50 
        ? value.substring(0, 50) + '...' 
        : value;
    log(`  ${key}=${displayValue}`, 'yellow');
  });
  
  // Confirm upload
  log('\n⚠️  This will add these variables to your Vercel project.', 'yellow');
  log('Make sure you have run "vercel login" and "vercel link" first.', 'yellow');
  
  // Upload variables
  log('\n🔄 Uploading variables to Vercel...', 'blue');
  let successCount = 0;
  let failCount = 0;
  
  for (const [key, value] of Object.entries(envVars)) {
    if (addEnvVarToVercel(key, value)) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  log('\n📊 Upload Summary:', 'blue');
  log(`✅ Successfully uploaded: ${successCount}`, 'green');
  log(`❌ Failed uploads: ${failCount}`, failCount > 0 ? 'red' : 'green');
  
  if (successCount > 0) {
    log('\n🎉 Environment variables uploaded successfully!', 'green');
    log('You can now deploy your application to Vercel.', 'green');
  }
  
  if (failCount > 0) {
    log('\n⚠️  Some variables failed to upload.', 'yellow');
    log('Please check the errors above and try again.', 'yellow');
  }
}

// Add async support for delays
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log(`❌ Script failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { parseEnvFile, addEnvVarToVercel };
