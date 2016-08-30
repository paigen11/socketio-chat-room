var http = require('http');
var fs = require('fs');

//server is what happens when someone loads up the page in a browser. 
//server is listening below for http traffic at port XXXX
var server = http.createServer(function(req, res){
	fs.readFile('index.html', 'utf-8', function(error, data){
		// console.log(error);
		// console.log(data);
		if(error){
			res.writeHead(500, {'content-type': 'text/html'});
			res.end(error);
		}else{
			res.writeHead(200, {'content-type': 'text/html'});	
			res.end(data);	
		}
	});
});

//include socketio module
var socketIo = require('socket.io');
// listen to the server which is listening on port XXXX
var io = socketIo.listen(server);
var socketUsers = [];
// we need to deal with a new socket connection
io.sockets.on('connect', function(socket){
	socketUsers.push(socket);
	
	socket.on('name_to_server', function(name){
		io.sockets.emit('users', {
			name: name.name	
		});
	});	

	console.log("someone connected via a socket");
	socket.on('message_to_server', function(data){
		io.sockets.emit('message_to_client', {
			message: data.message,
			name: data.name,
			date: data.date
		});
	});
	socket.on('disconnect', function(){
		console.log("A user has disconnected");
		var user = socketUsers.indexOf(socket);
		// socketUsers.splice(user,1);
		// io.sockets.emit('user_left', function(name){
		// 	name: name.name
		// });
	});
});

server.listen(8080);
console.log("listening on port 8080")