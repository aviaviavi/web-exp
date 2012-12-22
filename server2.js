var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

io.set('log level', 1);

var clientData = {};

app.use(express.static(__dirname));

io.sockets.on('connection', function (socket) {
  //socket.emit('news', { hello: 'world' });
  var address = socket.handshake.address;
  address = address.address.toString();
  socket.on('simulation-data', function (data) {
  	console.log(address);
  	if (!clientData[address]) {
  		clientData[address] = data;
    	console.log(data);
  	}
  });
  socket.on('response-data', function (data) {
  	console.log(address);
  	if (clientData[address]) {
  		clientData[address]['response'] = data['response'];
  		console.log('response added! ' + data);
  	}
  })
});

server.listen(80);