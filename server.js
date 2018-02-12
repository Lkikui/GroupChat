/*---------- modules ----------*/
//express
var express = require( "express");
var app = express();

//path
var path = require( "path");

//static 
app.use(express.static(path.join(__dirname, "./static")));

//views
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

/*---------- route ----------*/
//renders index page
app.get('/', function(request, response) {
    response.render("index");
});

/*---------- port ----------*/
var server = app.listen(8000, function() {
    console.log("GroupChat Project listening on port 8000");
});

var users = {};
var history = [];

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    console.log("Client/socket is connected!");
    console.log("Client/socket id is: ", socket.id);
    
    
    socket.on('got_new_user', function (data){
        console.log(`new user's name: ${data.username}`);
        if(users[data.username]) {
            socket.emit('failed_user', {error: 'username exists'});
        } else {
            users[data.username] = data.username;
            socket.emit('new_user', {new_user_name: users[data.username], history: history})
        }
    });

    socket.on('sending_message', function (data) {
        console.log("message sent from server:")
        console.log(data);

        history.push(data.text);
        console.log(history);

        io.emit('chat_history', {message: data.text});
    });

    socket.on('disconnect', function () {
        console.log(`${socket.id} has disconnected`);
    })
});