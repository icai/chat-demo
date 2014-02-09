
var express = require('express'),
    app = express()
    http = require('http'),
    socketio = require('socket.io'),
    path = require('path'),
    logger = require('winston'),
    program = require('commander');

// SETUP

logger.cli();
logger.default.transports.console.timestamp = true;

program.version('0.1')
    .option('-p, --port [num]', 'Set the server port (default 8080)')
    .option('-H, --disableheartbeats', 'Disable heartbeats')
    .parse(process.argv)


/**
 * Configuration
 */

app.configure(function(){
    app.set('port', process.env.PORT || program.port || 3000);
    logger.info("Setting port to " + app.get('port'));
    app.use(express.favicon());
    app.use(express.logger('short'));
    app.use(app.routes);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

    



/**
 * Routes
 */


app.get('/', function (req, res) {
  res.sendfile('publish/index.html');
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port "+ app.get('port') +" in "+ app.get('env') +" mode.");
});



 /**
  * Socket IO
  * @type {[type]}
  */
var io = socketio.listen(server);

io.configure(function() {
	if(program.disableheartbeats) {
	    io.set("heartbeats", false)
	}
    io.enable('browser client minification');
    io.set("log level", 0);
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