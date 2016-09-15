var express = require('express');
var app = express();

app.use(express.static('./'));

let portNumber = 5000;
app.listen(portNumber, function () {
  console.log('Example app listening on port ' + portNumber);
});
