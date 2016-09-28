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

let setAttendeeCount = (url, counts) => {
  let createData = () => {
    return Object.assign({
      _id : url,
      expires : (new Date()).getTime() + 3600000
    }, counts);
  };
  return new Promise(function(resolve, reject){
    getAttendeeCount(url, true).then(function(data){
      let updatedData = createData();
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

module.exports = {
  setAttendeeCount : setAttendeeCount,
  getAttendeeCount : getAttendeeCount
};
