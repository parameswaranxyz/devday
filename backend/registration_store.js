var google = require('googleapis');
let registrationEmail = require('./registration_mail');
let attendanceCache = require('./attendance_cache');
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

var key = require('../devday-753952375eca.json');
var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, SCOPES, null);

let getSheetName = function(data){
  return data.sheetName || 'Sheet 1';
}

let trimAndLower = function(str){
  str = str || '';
  return str.trim().toLowerCase()
}

let isUserInSheet = function(sheetData, emailAddress, mobile){
  sheetData.reverse();
  return sheetData.some(function(entry){
    return trimAndLower(entry[0]) === trimAndLower(emailAddress)
          && trimAndLower(entry[1]) === trimAndLower(mobile);
  });
}

function storeData(auth, data) {
  return new Promise(function(resolve, reject){
    let formattedDateTime = new Date(Date.now()+ (5.5 * 3600 * 1000)).toISOString().slice(0,-5).replace('T',' ')
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.append({
      access_token: auth.access_token,
      spreadsheetId: data.spreadsheetId,
      range: getSheetName(data),
      valueInputOption : 'USER_ENTERED',
      resource : {
        "majorDimension": 'ROWS',
        "values": [
          [formattedDateTime, data.name,data.email,data.mobile, data.event_url, data.title, data.abstract]
        ],
      }
    },{}, function(err, response) {
      if (err) {
        console.log('Error storing spreadsheet data');
        console.dir(err);
        reject(err);
        return;
      }
      resolve(response);
    });
  });
}

let getRegisteredPeople = (auth, data) => {
  return new Promise((resolve, reject) => {
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
      access_token: auth.access_token,
      spreadsheetId: data.spreadsheetId,
      range: getSheetName(data) + '!C2:E',
    }, function(err,resp){
      if(err){
        console.log("error getting sheet data");
        reject(err);
        return;
      }
      let values = resp.values.filter(function(row){
        return data.event_url === row[2];
      });

      resolve(values);
  })
});
}

let isUserRegistered = function(auth, data){
  return new Promise(function(resolve, reject){
    getRegisteredPeople(auth, data).then((resp) => {
      resolve(isUserInSheet(resp, data.email, data.mobile));
    }).catch((err) => {
      reject(err);
    })
  })
}

let authorize = () => {
  return new Promise((resolve, reject) => {
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        console.log("error getting jwt token");
        console.log(err);
        reject(err);
        return;
      }
      resolve(tokens);
  });
});
}

let store = (data) => {
  let authToken = {};
  return new Promise(function(resolve, reject){
    authorize().then((tokens) => {
      authToken = tokens;
      return isUserRegistered(tokens, data);
    }).then(function(userRegistered){
      if(userRegistered){
        resolve(204)
        return;
      }
      return storeData(authToken, data);
    }).then(function(response){
      if(data.present === 'true'){
        registrationEmail.send(data);
      }
      attendanceCache.newAttendeeRegistered(data.event_url);
      resolve(200);
    }).catch((err) => {
      console.log("Error storing details");
      console.dir(data);
      console.log(err);
      reject(err);
    });
  });
}

let getRegisteredCount = (sheetData, eventUrl) => {
  return new Promise(function(resolve, reject){
    authorize().then((tokens) => {
      sheetData.event_url = eventUrl;
      return getRegisteredPeople(tokens, sheetData)
    }).then((resp) => {
      resolve(resp.length);
    }).catch((err) => {
      console.dir(err);
      reject(err);
    });
  });
}

module.exports = {
  store : store,
  getRegisteredCount : getRegisteredCount
}
