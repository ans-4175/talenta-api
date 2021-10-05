const talenta = require("./index");
const cron = require("node-cron");
const pm2 = require("pm2");
const { cookiesTalenta, longitude, latitude, timeClockIn, timeClockOut } = require("./config");

const parseTime = (time) => {
  return time.split(":");
};

const scheduler = async (time, callback) => {
  const [hour, min] = parseTime(time);

  const task = cron.schedule(`${min} ${hour} * * 1-5`, async () => {
    console.log(await callback);
  });

  return task;
};

(async () => {
  if (timeClockIn && timeClockOut) {
    console.log(`Start scheduler for your clockIn every ${timeClockIn} and clockOut every ${timeClockOut}`);
    await scheduler(timeClockIn, talenta.clockIn({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: "Hello I am In" }));
    await scheduler(timeClockOut, talenta.clockOut({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: "Goodbye I am Out" }));
  }
})();
