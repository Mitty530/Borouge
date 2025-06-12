// Test script for Query Validation Service
// Run with: node test-query-validation.js

const { queryValidationService } = require('./src/services/queryValidationService');

console.log('🧪 Testing Query Validation Service\n');

// Test cases
const testCases = [
  // Valid queries
  { query: 'carbon emissions reduction strategies', expected: true, description: 'Valid ESG query' },
  { query: 'EU plastic regulations 2024', expected: true, description: 'Valid regulatory query' },
  { query: 'Borouge sustainability initiatives', expected: true, description: 'Valid company-specific query' },
  { query: 'CBAM carbon border adjustment', expected: true, description: 'Valid acronym query' },
  
  // Invalid queries - meaningless
  { query: 'AADWRDWSD', expected: false, description: 'Random characters' },
  { query: 'asdfghjkl', expected: false, description: 'Keyboard mashing' },
  { query: 'aaaaaaa', expected: false, description: 'Repeated characters' },
  { query: '12345', expected: false, description: 'Only numbers' },
  { query: 'qwerty', expected: false, description: 'Common test string' },
  
  // Invalid queries - too short
  { query: 'ab', expected: false, description: 'Too short' },
  { query: '', expected: false, description: 'Empty string' },
  
  // Invalid queries - not ESG related
  { query: 'how to cook pasta', expected: false, description: 'Unrelated to ESG' },
  { query: 'weather forecast tomorrow', expected: false, description: 'Unrelated to business' },
  { query: 'random topic discussion', expected: false, description: 'Generic unrelated query' },
  
  // Edge cases
  { query: 'carbon', expected: true, description: 'Single ESG keyword' },
  { query: 'sustainability', expected: true, description: 'Core ESG term' },
  { query: 'plastic waste management', expected: true, description: 'Industry-relevant query' }
];

// Run tests
testCases.forEach((testCase, index) => {
  const result = queryValidationService.validateQuery(testCase.query);
  const passed = result.isValid === testCase.expected;
  
  console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Query: "${testCase.query}"`);
  console.log(`  Description: ${testCase.description}`);
  console.log(`  Expected: ${testCase.expected ? 'Valid' : 'Invalid'}`);
  console.log(`  Actual: ${result.isValid ? 'Valid' : 'Invalid'}`);
  
  if (!result.isValid) {
    console.log(`  Reason: ${result.reason}`);
    console.log(`  Message: ${result.message}`);
  }
  
  if (result.isValid && result.relevanceScore) {
    console.log(`  Relevance Score: ${(result.relevanceScore * 100).toFixed(1)}%`);
  }
  
  console.log('');
});

console.log('🎯 Query Validation Testing Complete!');

// Test suggestion generation
console.log('\n📋 Testing Suggestion Generation:');
const invalidQuery = 'RANDOMTEXT123';
const validation = queryValidationService.validateQuery(invalidQuery);

if (!validation.isValid && validation.suggestions) {
  console.log(`\nFor invalid query "${invalidQuery}":`);
  console.log('Suggested categories:');
  validation.suggestions.forEach((category, index) => {
    console.log(`\n${index + 1}. ${category.category}:`);
    category.suggestions.forEach((suggestion, i) => {
      console.log(`   - ${suggestion}`);
    });
  });
}
