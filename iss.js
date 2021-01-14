const request = require('request');

// fetch our public IP Address, which will later help (approximately) locate us geographically
const fetchMyIP = function(callback) { 
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) return callback(error, null);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
}

// takes an ip and return e latitude and longitude
// https://freegeoip.app/{format}/{IP_or_hostname}
const fetchCoordsByIP = function(ip, callback){
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
     // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const { latitude, longitude }  = JSON.parse(body);
    callback(null, { latitude, longitude } );
  })
}

const fetchISSFlyOverTimes = function(coords, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`,
  (error, response, body) => {
    // error can be set if invalid domain, user is offline, etc.
   if (error) {
     callback(error, null);
     return;
   }

   // if non-200 status, assume server error
   if (response.statusCode !== 200) {
     const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
     callback(Error(msg), null);
     return;
   }

   const data  = JSON.parse(body);
   callback(null, data);
 })
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error){
      callback(error, null);
    }
    fetchCoordsByIP(ip, (error, coords) => {
      if (error){
        callback(error, null);
      }
      fetchISSFlyOverTimes(coords, (error, data) => {
        if (error){
          callback(error, null);
        }
        callback(null, data);
      })
    })
  })
}

module.exports = { nextISSTimesForMyLocation };