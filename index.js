const axios = require('axios');
const FormData = require('form-data');
const codec = require('string-codec');
const readlineSync = require("readline-sync");

let letCookiesTalenta = "_identity=identityCookie"
cookiesTalenta = "PHPSESSID=asdasdasdasdasdasd"
let latitude = "-6.861928521923624"
let longitude = "107.63578698474662"

const dataInput = () => {
  const inLat = readlineSync.question(`Set Latitude (default: ${latitude}): `)
  const inLong = readlineSync.question(`Set Longitude (default: ${longitude}): `)
  const inCookie = readlineSync.question(`Set Latitude (default: ${cookiesTalenta}): `)

  if(inLat!=""){
    latitude = inLat;
  }

  if(inLong!=""){
    longitude = inLong;
  }

  if(inCookie!=""){
    cookiesTalenta = inCookie;
  }
}

const prepForm = (obj) => {
  const { long, lat, desc, cookies, isCheckOut = false } = obj;
  const data = new FormData();
  const status = (isCheckOut) ? 'checkout' : 'checkin';

  const longEncoded = codec.encoder(codec.encoder(long,'base64'),'rot13');
  const latEncoded = codec.encoder(codec.encoder(lat,'base64'),'rot13');

  data.append('longitude', longEncoded);
  data.append('latitude', latEncoded);
  data.append('status', status);
  data.append('description', desc);

  const config = {
    method: 'post',
    url: 'https://hr.talenta.co/api/web/live-attendance/request',
    headers: { 
      'Cookie': cookies, 
      ...data.getHeaders()
    },
    data : data
  };

  return config;
};

const attendancePost = async (obj) => {
  const inputPrompt = dataInput();
  const config = prepForm(obj);
  const resp = await axios(config);

  return resp.data;
}

const clockIn = async (obj) => {
  return await attendancePost({ ...obj, isCheckOut: false});
}

const clockOut = async (obj) => {
  return await attendancePost({ ...obj, isCheckOut: true});
}

module.exports = {
  clockIn,
  clockOut
}


if(process.argv[2] == "clockin"){
  console.log(clockIn({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: 'Talenta Clock In' }));
}else if(process.argv[2] == "clockout"){
  console.log(clockOut({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: 'Talenta Clock In' }));
}