var express = require('express');
var app = express();
var bodyParser = require('body-parser');
let registrationStore = require('./src/backend/registration_store');
let attendeeCount = require('./src/backend/attendee_count');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static('./'));

app.get('/attendees', (req, res) => {
  attendeeCount.getAttendeeCount(req.query.meetup_url, req.query.meetup_event_id, JSON.parse(req.query.spreadsheetData)).then((resp) => {
    res.json({event_url : req.query['event_url'], yes_rsvp_count : resp});
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
