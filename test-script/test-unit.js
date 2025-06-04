#!/usr/bin/env node
/**
 * Unit tests for the fetchCookies functionality
 * 
 * Usage: node test-script/test-unit.js
 * 
 * This script will test the individual components of the fetchCookies function
 * without requiring actual credentials.
 */

const talenta = require('../index');
const { extractAuthenticityToken, extractCookies } = require('../lib/auth-helpers');

// Test helper functions
function testExtractAuthenticityToken() {
  console.log('🧪 Testing authenticity token extraction...');
  
  // Test cases with different HTML formats
  const testCases = [
    {
      html: '<input name="authenticity_token" value="abc123" />',
      expected: 'abc123'
    },
    {
      html: '<input type="hidden" name="authenticity_token" value="def456" />',
      expected: 'def456'
    },
    {
      html: '<form><input name="authenticity_token" value="ghi789" /></form>',
      expected: 'ghi789'
    },
    {
      html: '<div>no token here</div>',
      expected: null
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      // Use the actual function from auth-helpers
      const result = extractAuthenticityToken(testCase.html);
      
      if (result === testCase.expected) {
        console.log(`   ✅ Passed: "${testCase.html}" -> "${result}"`);
        passed++;
      } else {
        console.log(`   ❌ Failed: "${testCase.html}" expected "${testCase.expected}" got "${result}"`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`   Summary: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

function testExtractCookies() {
  console.log('🧪 Testing cookie extraction...');
  
  // Mock headers object
  const createMockHeaders = (setCookieValue) => ({
    get: (name) => name === 'set-cookie' ? setCookieValue : null
  });
  
  const testCases = [
    {
      setCookie: 'PHPSESSID=abc123; path=/; domain=.talenta.co',
      expected: 'PHPSESSID=abc123'
    },
    {
      setCookie: '_identity=def456; expires=..., other=value; path=/',
      expected: '_identity=def456; other=value'
    },
    {
      setCookie: null,
      expected: ''
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      const headers = createMockHeaders(testCase.setCookie);
      
      // Use the actual function from auth-helpers
      const result = extractCookies(headers);
      
      if (result === testCase.expected) {
        console.log(`   ✅ Passed: "${testCase.setCookie}" -> "${result}"`);
        passed++;
      } else {
        console.log(`   ❌ Failed: "${testCase.setCookie}" expected "${testCase.expected}" got "${result}"`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`   Summary: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

function testModuleExports() {
  console.log('🧪 Testing module exports...');
  
  const expectedFunctions = ['clockIn', 'clockOut', 'fetchCookies'];
  const actualFunctions = Object.keys(talenta);
  
  let passed = 0;
  let failed = 0;
  
  for (const func of expectedFunctions) {
    if (typeof talenta[func] === 'function') {
      console.log(`   ✅ Function ${func} is exported and is a function`);
      passed++;
    } else {
      console.log(`   ❌ Function ${func} is missing or not a function`);
      failed++;
    }
  }
  
  // Check for unexpected exports
  for (const func of actualFunctions) {
    if (!expectedFunctions.includes(func)) {
      console.log(`   ⚠️  Unexpected export: ${func}`);
    }
  }
  
  console.log(`   Summary: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

async function runTests() {
  console.log('🔧 Running unit tests for fetchCookies functionality...\n');
  
  const results = [
    testExtractAuthenticityToken(),
    testExtractCookies(),
    testModuleExports()
  ];
  
  const allPassed = results.every(result => result === true);
  
  if (allPassed) {
    console.log('✅ All unit tests passed!');
    console.log('\n💡 To test with real credentials, run:');
    console.log('   npm run test-fetch-cookies');
  } else {
    console.log('❌ Some unit tests failed!');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);