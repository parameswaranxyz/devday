var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static('./'));

app.post('/register', function(req, res){
  console.log("trying to register");
  console.dir(req.body);
  request.post({url : req.body.formUrl, form: req.body}, function(err,httpResponse,body){
    if(err){
      console.log("error registering");
      console.dir(err);
    }
    res.sendStatus(httpResponse.statusCode);
  })
})

let portNumber = 5000;
app.listen(portNumber, function () {
  console.log('Example app listening on port ' + portNumber);
});
