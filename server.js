
var express = require('express'),
    app = express()
    serv = require('http').createServer(app),
    io = require('socket.io').listen(serv),
    logger = require('winston'),
    program = require('commander');


    
//  
// SETUP
//

logger.cli();
logger.default.transports.console.timestamp = true;
    
program.version('0.1')
    .option('-p, --port [num]', 'Set the server port (default 8080)')
    .option('-H, --disableheartbeats', 'Disable heartbeats')
    .parse(process.argv)
    
var server = "localhost";
if(program.args.length==1) {
    server = program.args[0];
} else if (program.args.length==0) {
    logger.warn("Defaulting to localhost.");
}

var port = 3000;
if(program.port) {
    logger.info("Setting port to " + program.port);
    port = program.port;
}
//app.listen(port);

serv.listen(port); // socket io


//app.server.listen(port);

if(program.disableheartbeats) {
    io.set("heartbeats", false)
}

io.set("log level", 0);

//
// LISTENERS
//

app.use('/', express.static(__dirname + '/publish'));
app.get('/', function (req, res) {
  res.sendfile('index.html');
});


io.sockets.on('connection', function(socket) {
    socket.on('chat', function(data) {
        io.sockets.emit('chat', {text:data.text});
    });

    socket.on('disconnect', function(data) {
    });
    socket.on('room', function(data) {
        io.sockets.emit('room', {text:data.text});
    });
});

var buffer =[];
io.sockets.on('connection', function(client){
    var Room = "";
    client.on("setNickAndRoom", function(nick, fn){
        fn({msg : "Hello " + nick.nick});
        client.join(nick.room);
        Room = nick.room;
        client.broadcast.to(Room).json.send({ msg: "Se conecto al room: " + nick.room, nick : nick });
    });

    client.on('message', function(message, fn){
        var msg = message; //{ message: [client.sessionId, message] };
        buffer.push(msg);
        if (buffer.length > 15)
            buffer.shift();
        client.broadcast.to(Room).json.send(msg);
        fn(msg);
    });

    client.on('disconnect', function(){
        client.broadcast.to(Room).json.send({ msg: "disconnect"});
    });
    
});