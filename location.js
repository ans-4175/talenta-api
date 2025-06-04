const https = require('https');

/**
 * Detect user's current location using IP-based geolocation
 * @returns {Promise<{latitude: string, longitude: string}>} Location coordinates
 */
async function detectLocation() {
  return new Promise((resolve, reject) => {
    try {
      console.log('🌍 Detecting your location...');
      
      // Use ip-api.com for free IP geolocation (no API key required)
      const url = 'https://ip-api.com/json/?fields=lat,lon,city,country,status,message';
      
      const req = https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            
            if (result.status === 'fail') {
              reject(new Error(result.message || 'IP geolocation service error'));
              return;
            }
            
            if (!result.lat || !result.lon) {
              reject(new Error('Location coordinates not available'));
              return;
            }
            
            console.log(`✅ Location detected: ${result.lat}, ${result.lon} (${result.city}, ${result.country})`);
            
            resolve({
              latitude: result.lat.toString(),
              longitude: result.lon.toString()
            });
            
          } catch (parseError) {
            reject(new Error(`Failed to parse location response: ${parseError.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`Network request failed: ${error.message}`));
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Location detection timeout'));
      });
      
    } catch (error) {
      console.warn(`⚠️  Location detection failed: ${error.message}`);
      reject(error);
    }
  });
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