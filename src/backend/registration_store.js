var google = require('googleapis');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

var key = require('../../devday-753952375eca.json');
var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, SCOPES, null);
function storeData(auth, data) {
  return new Promise(function(resolve, reject){
    let formattedDateTime = (new Date()).toLocaleString('en-US',{ timeZone: 'Asia/Kolkata' });
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.append({
      access_token: auth.access_token,
      spreadsheetId: data.spreadsheetId,
      range: data.sheetName || 'Sheet1',
      valueInputOption : 'USER_ENTERED',
      resource : {
        "majorDimension": 'ROWS',
        "values": [
          [formattedDateTime, data.name,data.email,data.mobile]
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

let store = function(data){
  return new Promise(function(resolve, reject){
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        console.log("error getting jwt token");
        console.log(err);
        return;
      }
      storeData(tokens, data).then(function(response){
        resolve(response);
      }).catch(function(err){
        console.log("Error storing details");
        console.dir(data);
        console.log(err);
        reject(err);
      });
    })
  });
}

module.exports = {
  store : store
}
