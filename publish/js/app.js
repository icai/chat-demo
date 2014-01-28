var socket = io.connect('http://localhost:3000');

var socketIODemo = {
	room: function() {
		return {
			init: function() {}
		}
	},
	global: function() {
		return {
			init: function() {}
		}
	}
}


function sendChat(message) {
	socket.emit('chat', {
		text: 'message'
	});
}
socket.on('chat', function(data) {
	console.log(data);
})

var chati = null;
$(document).ready(function() {
	$("#setNickName").click(function() {
		$("#setNickSpace").hide();
		$("#chat").show();
		chati = new Chat;
		chati.Connect($("#nickname").val(), $("#room").val());
	});
	$('textarea#textSend').bind('keypress', function(e) {
		if (e.keyCode == 13) {
			sendMsg();
		}
	});

	$("#send").click(function() {
		sendMsg();
	});

	function sendMsg() {
		var m = $("#textSend").val();
		$("#textSend").val("");
		chati.Send(m);
	}
	var today = new Date();
	var offset = -(today.getTimezoneOffset() / 60);
});


function Chat() {
	this.socket = null;
	this.Nickname = "";
	this.Room = "";
	this.Connect = function(nick, room) {
		socket = socket || io.connect('http://localhost:3000');
		Nickname = nick;
		Room = room;
		//conectarse
		socket.on('connect', function(data) {
			socket.emit('setNickAndRoom', {
				nick: nick,
				room: room
			}, function(response) {
				$("#board").append("<p>" + response.msg + "</p>");
			});
		});
		//mensajes
		socket.on("message", function(msg, p, c) {
			$("#board").append("<p>" + msg.nick + ": " + msg.msg + "</p>");
		});
	};

	this.Send = function Send(msg) {
		socket.emit("message", {
			msg: msg,
			nick: Nickname
		}, function(response) {
			$("#board").append("<p>" + Nickname + ": " + msg + "</p>");
		});
	};
}