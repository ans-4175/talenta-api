const talenta = require("./index");
const { getLocation } = require("./location");
const config = require("./config");

const getCookies = async () => {
  // Check if email and password are provided for automatic authentication
  if (config.email && config.password) {
    console.log('🔐 Using automatic authentication with email/password...');
    try {
      return await talenta.fetchCookies(config.email, config.password);
    } catch (error) {
      console.warn('⚠️  Automatic authentication failed:', error.message);
      console.log('🔄 Falling back to manual cookies...');
      
      if (!config.cookiesTalenta || config.cookiesTalenta === 'PHPSESSID=<value>') {
        throw new Error('Manual cookies not configured. Please set either email/password or cookiesTalenta in config.js');
      }
      return config.cookiesTalenta;
    }
  }
  
  // Fallback to manual cookies
  if (!config.cookiesTalenta || config.cookiesTalenta === 'PHPSESSID=<value>') {
    throw new Error('Authentication not configured. Please set either:\n' +
      '1. email and password for automatic authentication, OR\n' +
      '2. cookiesTalenta for manual cookie authentication\n' +
      'Check config.js.tmpl for examples.');
  }
  
  console.log('🍪 Using manual cookie authentication...');
  return config.cookiesTalenta;
};

(async () => {
  try {
    // Get location (auto-detect or fallback to config)
    const location = await getLocation(config);
    
    // Get cookies (automatic or manual)
    const cookies = await getCookies();
    
    if (process.argv[2] == "clockin") {
      console.log(await talenta.clockIn({ 
        lat: location.latitude, 
        long: location.longitude, 
        cookies: cookies, 
        desc: "Hello I am In" 
      }));
    } else if (process.argv[2] == "clockout") {
      console.log(await talenta.clockOut({ 
        lat: location.latitude, 
        long: location.longitude, 
        cookies: cookies, 
        desc: "Goodbye I am Out" 
      }));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
