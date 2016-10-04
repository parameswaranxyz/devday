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

let getAttendeeCount = (meetupEventUrl, eventId, spreadsheetData, eventUrl) => {
  return new Promise((resolve, reject) => {
    cache.getAttendeeCount(eventUrl).then((data) => {
      if(data){
        resolve(data.meetup + data.store);
        return;
      }
    Promise.all([
      getMeetupAttendeeCount(meetupEventUrl, eventId),
      registrationStore.getRegisteredCount(spreadsheetData, eventUrl)
    ]).then((values) => {
      cache.setAttendeeCount(eventUrl, {meetup : values[0], store : values[1]});
      let finalCount = values.reduce(function(prev, current) { return prev + current;}, 0)
      resolve(finalCount);
    });
  }).catch((err) => {
    reject(err);
  });
  });
}

let newAttendeeRegistered = (eventUrl) => {
  cache.getAttendeeCount(eventUrl, true).then((data) => {
    data.store = data.store + 1;
    return cache.setAttendeeCount(eventUrl, data);
  });
}

module.exports = {
  getAttendeeCount : getAttendeeCount,
  newAttendeeRegistered : newAttendeeRegistered
}
