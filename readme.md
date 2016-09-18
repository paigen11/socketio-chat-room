#What is it?
---
A multiplayer site where users can chat back and forth and draw together using HTML's canvas, Node.js and Socket.io. Users can see who's in the chat room, choose drawing color and line thickness as well as clear all player's canvases at once.

##Live demo
---
[Live demo](http://paigeniedringhaus.com/drawTogether/)

##Languages Used
---
  * HTML
  * CSS
  * JavaScript
  * Node.js
  * Socket.io

##Link to Github
---
[Github](https://github.com/paigen11/socketio-chat-room)

##Authors
---
Paige Niedringhaus

##Screenshots
---
Starting screen when users join room
![alt text](https://github.com/paigen11/socketio-chat-room/blob/master/screenshots/start-screen.png 'start-screen.png')

Example of multiple users chatting back and forth to each other
![alt text](https://github.com/paigen11/socketio-chat-room/blob/master/screenshots/chat.png 'chat.png')

Display of the users in the chat room at the moment (updated dynamically as people enter and leave)
![alt text](https://github.com/paigen11/socketio-chat-room/blob/master/screenshots/people-in-chat.png 'people-in-chat.png')

Draw together feature where users can draw pictures on HTML canvas 
![alt text](https://github.com/paigen11/socketio-chat-room/blob/master/screenshots/group-drawing.png 'group-drawing.png')

##Further Info
---
This app was styled with the assistance of Bootstrap's CSS. However, in order for the canvas (and drawing lines on the canvas to display correctly), the canvas height must be manually set in the HTML and Bootstrap columns must not be used on it.

To dynamically update who's in the chat room (and what name they're using) without constantly adding more names to the list, users names and socket ID's were pushed to an array on the socket.io server and the array's names were then displayed back to the entire chat room, updated each time someone joined or left the chat, or changed their username mid-session.

The same socket.io 'emit' and 'on' functionality was used to update the chat box as people typed messages and drew on the canvas. 

##Requirements
---
To set this up, [Node.js](https://docs.npmjs.com/getting-started/installing-node) and [socket.io](https://www.npmjs.com/package/socket.io) need to be downloaded with --save behind their install commands to save them to the package.json dependencies. 

I also installed [nodemon](https://www.npmjs.com/package/nodemon) so I wouldn't have to keep starting and stopping the node server.js command each time I updated the code base. If you use this, use --save to make it a dependency as well.

##Code Examples
---
JavaScript for socket.io server connection and delivering messages to all users

```javascript
var socketio = io.connect('http://127.0.0.1:8080');
		var name = prompt("What is your name?");
		socketio.emit('name_to_server', name);

		socketio.on('message_to_client', function(data){
			if(data.name !== 'anonymous'){
			document.getElementById('chats').innerHTML += '<div class="im">' + data.name + '--' + data.message + '--' + data.date + '</div>';
			}
		});
```

JavaScript assigning users a name and ID as soon as they join the chat room, pushing the object onto an array and sending the function back to display in the HTML.

```javascript
io.sockets.on('connect', function(socket){
	socketUsers.push({
		socketID: socket.id,
		name: 'Anonymous'
	});
	io.sockets.emit('users', socketUsers); 
	socket.on('name_to_server', function(name){	
		for(var i = 0; i < socketUsers.length; i++){
			if(socketUsers[i].socketID == socket.id){
				socketUsers[i].name = name;
				break;
			}
		}
		io.sockets.emit('users', socketUsers);	
	});
});	
```

JavaScript for canvas drawings, and the function to pass it through socket.io and show it to all the other users 

```javascript
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		var mouseDown = false;
		var color = null;
		var thickness = 10;
		var colorChoice = document.getElementById('color-picker');
		var mousePosition;
		var lastMousePosition = null;
		var eraseData = false;
		colorChoice.addEventListener('change', function(event){
			color = colorChoice.value;
			console.log(color);
		});
		var thicknessPicker = document.getElementById('thickness-picker');
		thicknessPicker.addEventListener('change', function(event){
			thickness = thicknessPicker.value;
			console.log(thickness);
		});
		canvas.addEventListener('mousedown', function(event){
			mouseDown = true;
		});
		canvas.addEventListener('mouseup', function(event){
			mouseDown = false;
			lastMousePosition = null;
		})
		canvas.addEventListener('mousemove', function(event){
			if(mouseDown){
				var magicBrushX = event.pageX - canvas.offsetLeft;
				var magicBrushY = event.pageY - canvas.offsetTop;
				// console.log(magicBrushX);
				// console.log(magicBrushY);
				mousePosition = {
					x: magicBrushX,
					y: magicBrushY
				}
				if(lastMousePosition !== null){	
					context.strokeStyle = color;
					context.lineJoin = 'round';
					context.lineWidth = thickness;
					context.beginPath();
					context.moveTo(lastMousePosition.x, lastMousePosition.y);
					context.lineTo(mousePosition.x, mousePosition.y);
					context.closePath();
					context.stroke();
				}
				var drawingData = {
					mousePosition: mousePosition,
					lastMousePosition: lastMousePosition,
					color: color,
					thickness: thickness
				}
				socketio.emit('drawing_to_server', drawingData);
				lastMousePosition = {
					x: mousePosition.x,
					y: mousePosition.y
				};
			}	
		})
socketio.on('drawing_to_client', function(drawingData){
	context.strokeStyle = drawingData.color;
	context.lineJoin = 'round';
	context.lineWidth = drawingData.thickness;
	context.beginPath();
	context.moveTo(drawingData.lastMousePosition.x, drawingData.lastMousePosition.y);
	context.lineTo(drawingData.mousePosition.x, drawingData.mousePosition.y);
	context.closePath();
	context.stroke();
})	
```