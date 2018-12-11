var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
   res.sendFile(__dirname + "/" + "index.html" );
})
app.get('/dateInput.js', function (req, res) {
  res.sendFile(__dirname + "/" + "dateInput.js" );
})
app.get('/date-input.css', function (req, res) {
  res.sendFile(__dirname + "/" + "date-input.css" );
})
app.get('/date.json', function (req, res) {
  res.sendFile(__dirname + "/" + "date.json" );
})

var server = app.listen(8081, function () { 
   console.log("Server is listening to http://localhost:%s", server.address().port)
})