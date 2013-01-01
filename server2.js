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

//surpress some of the defualt logging
io.set('log level', 1);

//connect to db
connection.connect(function (err) {
  if (err) console.log(err);
});

//test is the db name as of now.
connection.query('use test');

//error handling, in case db disconnects
function handleDisconnect(connection) {
  connection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }

    console.log('Re-connecting lost connection: ' + err.stack);

    connection = mysql.createConnection(connection.config);
    handleDisconnect(connection);
    connection.connect();
  });
}
handleDisconnect(connection);

//initiate in memory client data
var clientData = {};
//put all of the subjects already in the database back in clientData
connection.query('SELECT d.subject_addr, r.response FROM data d, response r WHERE r.subject_addr = d.subject_addr', function (err, results, fields) {
  for (i = 0; i < results.length; i++) {
    clientData[results[i]['subject_addr']] = {'data': true};
    clientData[results[i]['subject_addr']]['response'] = results[i]['response'];
  }
});

//serve the files
app.use(express.static(__dirname));

//event handling
io.sockets.on('connection', function (socket) {

  var address = socket.handshake.address;
  address = address.address.toString();

  //sent once the house and infection data is determined.
  socket.on('simulation-data', function (data) {
    //if we haven't seen this address yet, add the data to 'data' table
    if (!clientData[address]) {
      clientData[address] = {'data': true};
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
  	if (clientData[address] && !clientData[address]['response']) {
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