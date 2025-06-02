const axios = require("axios");
const FormData = require("form-data");
const codec = require("string-codec");

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
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Referer": "https://hr.talenta.co/live-attendance",
      "Origin": "https://hr.talenta.co",
      "X-Requested-With": "XMLHttpRequest",
      ...data.getHeaders(),
    },
    data: data,
  };

  return config;
};

const attendancePost = async (obj) => {
  const config = prepForm(obj);
  const resp = await axios(config);

  return resp.data;
};

const clockIn = async (obj) => {
  return await attendancePost({ ...obj, isCheckOut: false });
};

const clockOut = async (obj) => {
  return await attendancePost({ ...obj, isCheckOut: true });
};

module.exports = {
  clockIn,
  clockOut,
};
