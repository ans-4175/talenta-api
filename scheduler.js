const talenta = require("./index");
const cron = require("node-cron");
const { getLocation } = require("./location");

const config = require("./config");

const parseTime = (time) => {
  return time.split(":");
};

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

const scheduler = async (time, callback) => {
  const [hour, min] = parseTime(time);

  const task = cron.schedule(`${min} ${hour} * * 1-5`, async () => {
    console.log(await callback());
  });

  return task;
};

(async () => {
  if (config.timeClockIn && config.timeClockOut) {
    console.log(`Start scheduler for your clockIn every ${config.timeClockIn} and clockOut every ${config.timeClockOut}`);
    
    // Get location once at startup for scheduler
    let location;
    try {
      location = await getLocation(config);
      console.log(`Using location: ${location.latitude}, ${location.longitude}`);
    } catch (error) {
      console.error("❌ Error getting location:", error.message);
      process.exit(1);
    }
    
    // Get cookies once at startup for scheduler
    let cookies;
    try {
      cookies = await getCookies();
      console.log('✅ Authentication configured successfully');
    } catch (error) {
      console.error("❌ Error with authentication:", error.message);
      process.exit(1);
    }
    
    await scheduler(config.timeClockIn, () => talenta.clockIn({ 
      lat: location.latitude, 
      long: location.longitude, 
      cookies: cookies, 
      desc: "Hello I am In" 
    }));
    
    await scheduler(config.timeClockOut, () => talenta.clockOut({ 
      lat: location.latitude, 
      long: location.longitude, 
      cookies: cookies, 
      desc: "Goodbye I am Out" 
    }));
  } else {
    console.error("✖︎ Error: timeClockIn and timeClockOut undefined");
    process.exit(1);
  }
})();
