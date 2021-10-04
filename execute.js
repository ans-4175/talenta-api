const talenta = require("./index.js")

// you can use the `_identity=` or `PHPSESSID=` cookie
const cookiesTalenta = "_identity=identityCookie"
const latitude = "-6.861928521923624"
const longitude = "107.63578698474662"

if(process.argv[2] == "clockin"){
  console.log(talenta.clockIn({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: 'Talenta Clock In' }));
}else if(process.argv[2] == "clockout"){
  console.log(talenta.clockOut({ lat: latitude, long: longitude, cookies: cookiesTalenta, desc: 'Talenta Clock In' }));
}