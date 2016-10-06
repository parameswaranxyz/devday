let PouchDB = require('pouchdb');
attendanceDb = new PouchDB('attendancedb');

let getAttendeeCount = (url, skipCacheCheck) => {
  return new Promise((resolve, reject) => {
    attendanceDb.get(url).then((data) => {
      if(skipCacheCheck){
        resolve(data);
        return;
      }
      if(data.expires < (new Date()).getTime()){
        resolve(null);
        return;
      }
      resolve(data);
      return;
    }).catch((err) => {
      console.dir(err);
      resolve(null);
    });
  });
};

let setAttendeeCount = (url, otherAttributes) => {
  let createData = () => {
    return {
      _id : url,
      expires : (new Date()).getTime() + 3600000
    };
  };
  return new Promise(function(resolve, reject){
    getAttendeeCount(url, true).then(function(data){
      let updatedData = Object.assign({}, data, createData(), otherAttributes);
      if(data){
        updatedData._rev = data._rev
      }
      return attendanceDb.put(updatedData);
    }).catch((err) => {
      console.log("error updating data");
      console.dir(err);
      reject(err);
    })
  })
}

let newAttendeeRegistered = (eventUrl) => {
  getAttendeeCount(eventUrl, true).then((data) => {
    data.store = data.store + 1;
    return setAttendeeCount(eventUrl, data);
  });
}

module.exports = {
  setAttendeeCount : setAttendeeCount,
  getAttendeeCount : getAttendeeCount,
  newAttendeeRegistered : newAttendeeRegistered
};
