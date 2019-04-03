var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/'));

//server.listen(3000, "0.0.0.0");
server.listen(80, process.env.OPENSHIFT_NODEJS_IP || process.env.IP);
console.log('Server Started . . .');

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('buttonPressed', function (button, pressed) {
    console.log(button, pressed);
    io.emit('button', button, pressed);
  });

  socket.on('firePressed', function (state) {
    io.emit('fire');
  });

});
