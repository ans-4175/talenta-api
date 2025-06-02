#!/usr/bin/env node
/**
 * Test script to verify the signature fix
 * 
 * Usage: node test-fix.js
 * 
 * This script will test the enhanced API with CSRF token support
 * and better error handling to help diagnose signature issues.
 */

const talenta = require('./index');

async function testFix() {
    console.log('🔧 Testing Talenta API signature fix...\n');
    
    // Check if config file exists
    let config;
    try {
        config = require('./config');
        console.log('✅ Config file loaded successfully');
    } catch (error) {
        console.log('❌ Config file not found. Please copy config.js.tmpl to config.js and configure it.');
        console.log('   Required fields: cookiesTalenta, latitude, longitude');
        return;
    }
    
    // Validate required config
    const required = ['cookiesTalenta', 'latitude', 'longitude'];
    const missing = required.filter(field => !config[field]);
    
    if (missing.length > 0) {
        console.log(`❌ Missing required config fields: ${missing.join(', ')}`);
        return;
    }
    
    console.log('✅ Config validation passed');
    console.log(`   Cookies: ${config.cookiesTalenta.substring(0, 20)}...`);
    console.log(`   Location: ${config.latitude}, ${config.longitude}\n`);
    
    console.log('🚀 Testing clock-in with enhanced signature support...');
    
    try {
        const result = await talenta.clockIn({
            lat: config.latitude,
            long: config.longitude,
            cookies: config.cookiesTalenta,
            desc: 'Test clock-in with signature fix'
        });
        
        console.log('✅ SUCCESS! Clock-in request completed:');
        console.log(JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.log('❌ Clock-in failed:');
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            console.log(`   Status: ${status}`);
            console.log(`   Response:`, JSON.stringify(data, null, 2));
            
            if (status === 403 && data?.error_type === 'Signature') {
                console.log('\n🔍 SIGNATURE ERROR DIAGNOSIS:');
                console.log('   - The API is still returning signature errors');
                console.log('   - Your cookies may be expired or invalid');
                console.log('   - Try getting fresh cookies from your browser');
                console.log('   - Make sure you\'re logged into Talenta');
            } else if (status === 401) {
                console.log('\n🔍 AUTHENTICATION ERROR:');
                console.log('   - Your cookies appear to be expired');
                console.log('   - Please login to Talenta and get fresh cookies');
            } else {
                console.log('\n🔍 OTHER ERROR:');
                console.log('   - Check your network connection');
                console.log('   - Verify your latitude/longitude values');
            }
        } else {
            console.log(`   Error: ${error.message}`);
        }
    }
}

// Run the test
testFix().catch(console.error);