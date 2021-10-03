const talenta = require("./index.js")
const readlineSync = require("readline-sync");

let letCookiesTalenta = "_identity=identityCookie"
cookiesTalenta = "PHPSESSID=asdfasdfasdf"
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

dataInput();

if(process.argv[2] == "clockin"){
  console.log(talenta.clockIn({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: 'Talenta Clock In' }));
}else if(process.argv[2] == "clockout"){
  console.log(talenta.clockOut({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: 'Talenta Clock In' }));
}