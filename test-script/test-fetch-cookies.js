#!/usr/bin/env node
/**
 * Test script to verify the fetchCookies functionality
 * 
 * Usage: node test-script/test-fetch-cookies.js
 * 
 * This script will test the new fetchCookies function that automates
 * the authentication process to get session cookies.
 */

const talenta = require('../index');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    const onData = (char) => {
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          console.log(''); // New line
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    };
    
    process.stdin.on('data', onData);
  });
}

async function testFetchCookies() {
  console.log('🔧 Testing Talenta Cookie Fetching...\n');
  
  try {
    // Get credentials from user
    const email = await askQuestion('Enter your Talenta email: ');
    const password = await askPassword('Enter your Talenta password: ');
    
    console.log('🚀 Testing fetchCookies function...\n');
    
    // Test fetchCookies
    const cookies = await talenta.fetchCookies(email, password);
    
    console.log('\n✅ SUCCESS! Cookies fetched successfully:');
    console.log(`   Cookies: ${cookies}\n`);
    
    // Test if cookies work with clockIn
    console.log('🧪 Testing cookies with clockIn function...');
    
    try {
      const result = await talenta.clockIn({
        lat: '-6.000',
        long: '107.000',
        cookies: cookies,
        desc: 'Test with auto-fetched cookies'
      });
      
      console.log('✅ SUCCESS! ClockIn with auto-fetched cookies worked:');
      console.log(JSON.stringify(result, null, 2));
      
    } catch (clockInError) {
      console.log('⚠️  ClockIn test result:');
      
      if (clockInError.response) {
        const status = clockInError.response.status;
        const data = clockInError.response.data;
        
        console.log(`   Status: ${status}`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
        
        if (status === 200 || (status >= 400 && status < 500)) {
          console.log('   Note: This may be normal if you already clocked in today or location is different');
        }
      } else {
        console.log(`   Error: ${clockInError.message}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Cookie fetching failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('Invalid email or password')) {
      console.log('\n💡 Suggestions:');
      console.log('   - Double-check your email and password');
      console.log('   - Make sure your account is not locked');
      console.log('   - Try logging in manually first');
    } else {
      console.log('\n💡 Suggestions:');
      console.log('   - Check your internet connection');
      console.log('   - Try again in a few minutes');
      console.log('   - The authentication flow may have changed');
    }
  } finally {
    rl.close();
  }
}

// Run the test
testFetchCookies().catch(console.error);