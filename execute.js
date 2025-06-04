const talenta = require("./index");
const { getLocation } = require("./location");
const config = require("./config");

(async () => {
  try {
    // Get location (auto-detect or fallback to config)
    const location = await getLocation(config);
    
    if (process.argv[2] == "clockin") {
      console.log(await talenta.clockIn({ 
        lat: location.latitude, 
        long: location.longitude, 
        cookies: config.cookiesTalenta, 
        desc: "Hello I am In" 
      }));
    } else if (process.argv[2] == "clockout") {
      console.log(await talenta.clockOut({ 
        lat: location.latitude, 
        long: location.longitude, 
        cookies: config.cookiesTalenta, 
        desc: "Goodbye I am Out" 
      }));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
