var express = require('express');
var app = express();
var bodyParser = require('body-parser');
let registrationStore = require('./src/backend/registration_store');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static('./'));

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
