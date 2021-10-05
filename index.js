const axios = require("axios");
const FormData = require("form-data");
const codec = require("string-codec");
const cron = require("node-cron");

const prepForm = (obj) => {
  const { long, lat, desc, cookies, isCheckOut = false } = obj;
  const data = new FormData();
  const status = isCheckOut ? "checkout" : "checkin";

  const longEncoded = codec.encoder(codec.encoder(long, "base64"), "rot13");
  const latEncoded = codec.encoder(codec.encoder(lat, "base64"), "rot13");

  data.append("longitude", longEncoded);
  data.append("latitude", latEncoded);
  data.append("status", status);
  data.append("description", desc);

  const config = {
    method: "post",
    url: "https://hr.talenta.co/api/web/live-attendance/request",
    headers: {
      Cookie: cookies,
      ...data.getHeaders(),
    },
    data: data,
  };

  return config;
};

const parseTime = (time) => {
  return time.split(":");
};

const attendancePost = async (obj) => {
  const config = prepForm(obj);
  const resp = await axios(config);

  return resp.data;
};

const scheduler = async (time, callback) => {
  const [hour, min] = parseTime(time);

  const task = cron.schedule(`${min} ${hour} * * 1-5`, async () => {
    console.log(await callback);
  });

  return task;
};

const clockIn = async (obj) => {
  const { timeClockIn } = obj;
  if (timeClockIn) {
    const task = await scheduler(timeClockIn, attendancePost({ ...obj, isCheckOut: false }));
    return `Start scheduler for your clockIn every ${timeClockIn}`;
  }

  return await attendancePost({ ...obj, isCheckOut: false });
};

const clockOut = async (obj) => {
  const { timeClockOut } = obj;
  if (timeClockOut) {
    const task = await scheduler(timeClockOut, attendancePost({ ...obj, isCheckOut: true }));
    return `Start scheduler for your clockOut every ${timeClockOut}`;
  }

  return await attendancePost({ ...obj, isCheckOut: true });
};

module.exports = {
  clockIn,
  clockOut,
};
