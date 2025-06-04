const puppeteer = require('puppeteer');

/**
 * Detect user's current location using browser geolocation API
 * @returns {Promise<{latitude: string, longitude: string}>} Location coordinates
 */
async function detectLocation() {
  let browser;
  
  try {
    console.log('🌍 Detecting your location...');
    
    // Launch browser with necessary permissions
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-background-timer-throttling'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set geolocation permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://www.google.com', ['geolocation']);
    
    // Navigate to a simple page
    await page.goto('data:text/html,<html><body></body></html>');
    
    // Get location using browser geolocation API
    const location = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }
        
        const timeoutId = setTimeout(() => {
          reject(new Error('Location detection timeout'));
        }, 10000); // 10 second timeout
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            resolve({
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            clearTimeout(timeoutId);
            reject(new Error(`Geolocation error: ${error.message}`));
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000
          }
        );
      });
    });
    
    console.log(`✅ Location detected: ${location.latitude}, ${location.longitude} (accuracy: ${Math.round(location.accuracy)}m)`);
    
    return {
      latitude: location.latitude,
      longitude: location.longitude
    };
    
  } catch (error) {
    // Handle common Chrome/Puppeteer installation issues
    if (error.message.includes('Could not find Chrome') || error.message.includes('Failed to launch')) {
      console.warn('⚠️  Chrome browser not available for location detection');
      throw new Error('Browser not available for location detection');
    } else {
      console.warn(`⚠️  Location detection failed: ${error.message}`);
      throw error;
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Get location with fallback to config values
 * @param {Object} config - Configuration object with fallback lat/long
 * @returns {Promise<{latitude: string, longitude: string}>} Location coordinates
 */
async function getLocation(config = {}) {
  try {
    // Try to detect location automatically
    const detectedLocation = await detectLocation();
    return detectedLocation;
  } catch (error) {
    // Fallback to config values
    if (config.latitude && config.longitude) {
      console.log('📍 Using configured location as fallback');
      return {
        latitude: config.latitude,
        longitude: config.longitude
      };
    } else {
      throw new Error('Unable to detect location and no fallback coordinates provided in config');
    }
  }
}

module.exports = {
  detectLocation,
  getLocation
};