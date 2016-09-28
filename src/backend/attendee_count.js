let request = require('request');
let meetupApiKey = '486f5c16b197a295c58645334675c75';

let getMeetupAttendeeCount = (url, eventId) =>{
  return new Promise((resolve, reject) => {
    let requestUrl = 'https://api.meetup.com/'+  url + '/events/'+ eventId + '?&sign=true&photo-host=public&key=' + meetupApiKey;
    console.log(requestUrl);
    request(requestUrl, (err, resp, body) => {
      if(err){
        reject(err);
        return;
      }
      resolve(JSON.parse(body).yes_rsvp_count || '');
    })
  }).catch((err) => {
    reject(err);
  });
};

module.exports = {
  getAttendeeCount : getMeetupAttendeeCount
}
