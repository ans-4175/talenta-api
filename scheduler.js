const talenta = require("./index");
const { cookiesTalenta, longitude, latitude, timeClockIn, timeClockOut } = require("./config");

(async () => {
  if (timeClockIn && timeClockOut) {
    console.log(`Start scheduler for your clockIn every ${timeClockIn} and clockOut every ${timeClockOut}`);
    await talenta.scheduler(
      timeClockIn,
      talenta.clockIn({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: "Hello I am In" })
    );
    await talenta.scheduler(
      timeClockOut,
      talenta.clockOut({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: "Goodbye I am Out" })
    );
  }
})();
