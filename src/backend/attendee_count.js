let request = require('request');
let meetupApiKey = '486f5c16b197a295c58645334675c75';
let cache = require('./attendance_cache');

let getMeetupAttendeeCount = (url, eventId) => {
  return new Promise((resolve, reject) => {
    cache.getAttendeeCount(url).then((data) => {
      if(data){
        resolve(data.meetup);
        return;
      }
    let requestUrl = 'https://api.meetup.com/'+  url + '/events/'+ eventId + '?&sign=true&photo-host=public&key=' + meetupApiKey;
    request(requestUrl, (err, resp, body) => {
      if(err){
        reject(err);
        return;
      }
      let attendanceCount = JSON.parse(body).yes_rsvp_count;
      cache.setAttendeeCount(url, {meetup : attendanceCount});
      resolve(attendanceCount || '');
    })
  }).catch((err) => {
    reject(err);
  });
  });
}

module.exports = {
  getAttendeeCount : getMeetupAttendeeCount
}
