var express = require('express');
var app = express();
var bodyParser = require('body-parser');
let registrationStore = require('./backend/registration_store');
let attendeeCount = require('./backend/attendee_count');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static('./'));

app.get('/attendees/:event_url', (req, res) => {
  let query = req.query;
  let data = JSON.parse(query.spreadsheetData);
  let eventUrl = req.params.event_url;
  attendeeCount.getAttendeeCount(query.meetup_url, query.meetup_event_id, data, eventUrl).then((resp) => {
    res.json({event_url : eventUrl, yes_rsvp_count : resp});
  }).catch((err) => {
    console.log("error getting attendee count");
    console.log(err);
    res.sendStatus(500);
  });
});

app.post('/register', function(req, res){
  registrationStore.store(req.body).then(function(respStatus){
    res.sendStatus(respStatus);
  }).catch(function(err){
    res.sendStatus(500);
  })
})

let portNumber = 5000;
app.listen(portNumber, function () {
  console.log('DevDay Backend listening on port ' + portNumber);
});
