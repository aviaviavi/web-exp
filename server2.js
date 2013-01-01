var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , mysql = require('mysql')
  , io = require('socket.io').listen(server)
  , connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'ghostdad',
  });

io.set('log level', 1);

var clientData = {};

connection.connect(function (err) {
  if (err) console.log(err);
});

//test is the db name as of now.
connection.query('use test');

app.use(express.static(__dirname));

io.sockets.on('connection', function (socket) {

  var address = socket.handshake.address;
  address = address.address.toString();

  //sent once the house and infection data is determined.
  socket.on('simulation-data', function (data) {
    //if we haven't seen this address yet, add the data to 'data' table
    if (!clientData[address]) {
      clientData[address] = data;
      console.log(data);
      connection.query('INSERT INTO data SET subject_addr = ?, data = ?', [address, JSON.stringify(data)], function (err, result) {
        if (err) throw err;
        console.log('data inserted!');
      });
    }
  });

  //sent once user submits response
  socket.on('response-data', function (data) {
    //if the address exists but doesn't have a reponse, add it to the 'response table'
  	if (clientData[address] && !clientData['response']) {
  		clientData[address]['response'] = data['response'];
  		console.log('response added! ' + data['response']);
      connection.query('INSERT INTO response SET subject_addr = ?, response = ?', [address, data['response']], function (err, result) {
        if (err) throw err;
        console.log('data inserted!');
      });
  	}
  });
});

server.listen(80);