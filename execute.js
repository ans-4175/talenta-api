const talenta = require("./index");
const { cookiesTalenta, longitude, latitude, timeClockIn, timeClockOut, onWeekdays } = require("./config");

(async () => {
  if (process.argv[2] == "clockin") {
    console.log(
      await talenta.clockIn({
        lat: latitude,
        long: longitude,
        cookies: cookiesTalenta,
        desc: "Hello I am In",
        timeClockIn,
        onWeekdays,
      })
    );
  } else if (process.argv[2] == "clockout") {
    console.log(
      await talenta.clockOut({
        lat: latitude,
        long: longitude,
        cookies: cookiesTalenta,
        desc: "Goodbye I am Out",
        timeClockOut,
        onWeekdays,
      })
    );
  }
  // else if (process.argv[2] == "scheduled") {
  //   console.log(await talenta.scheduled({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: "Goodbye I am Out" }));
  // }
})();
