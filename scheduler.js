const talenta = require("./index");
const cron = require("node-cron");
const { getLocation } = require("./location");

const config = require("./config");

const parseTime = (time) => {
  return time.split(":");
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
    
    await scheduler(config.timeClockIn, () => talenta.clockIn({ 
      lat: location.latitude, 
      long: location.longitude, 
      cookies: config.cookiesTalenta, 
      desc: "Hello I am In" 
    }));
    
    await scheduler(config.timeClockOut, () => talenta.clockOut({ 
      lat: location.latitude, 
      long: location.longitude, 
      cookies: config.cookiesTalenta, 
      desc: "Goodbye I am Out" 
    }));
  } else {
    console.error("✖︎ Error: timeClockIn and timeClockOut undefined");
    process.exit(1);
  }
})();
