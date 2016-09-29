let request = require('request');
let meetupApiKey = '486f5c16b197a295c58645334675c75';
let cache = require('./attendance_cache');
let registrationStore = require('./registration_store');

let getMeetupAttendeeCount = (url, eventId) => {
  return new Promise((resolve, reject) => {
    let requestUrl = 'https://api.meetup.com/'+  url + '/events/'+ eventId + '?&sign=true&photo-host=public&key=' + meetupApiKey;
    request(requestUrl, (err, resp, body) => {
      if(err){
        reject(err);
        return;
      }
      let attendanceCount = JSON.parse(body).yes_rsvp_count;
      resolve(attendanceCount);
    })
  })
}

let getAttendeeCount = (url, eventId, spreadsheetId, sheetName) => {
  return new Promise((resolve, reject) => {
    cache.getAttendeeCount(url).then((data) => {
      if(data){
        resolve(data.meetup + data.store);
        return;
      }
    Promise.all([
      getMeetupAttendeeCount(url, eventId),
      registrationStore.getRegisteredCount(spreadsheetData)
    ]).then((values) => {
      cache.setAttendeeCount(url, {meetup : values[0], store : values[1]});
      resolve(values.reduce(function(prev, current) { return prev + current;}));
    });
  }).catch((err) => {
    reject(err);
  });
  });
}

module.exports = {
  getAttendeeCount : getAttendeeCount
}
