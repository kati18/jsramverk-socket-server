// Kmom06
/**
 * A cleaned-up and validated copy of server-kmom06_copy.js
 * Parts of below code from:
 * https://dev.to/rexeze/how-to-build-a-real-time-chat-app-with-nodejs-socketio-and-mongodb-2kho
 */

/** An application that uses the Node.js driver to connect to a MongoDB instance
 * (a MongoDB database)
 */

"use strict";

/** Express initializes app (the express app) be a function handler that can be supplied
 * to an HTTP server:
 */
const app = require('express')();
// alt.:
// const express = require('express');
// const app = express();

const server = require('http').Server(app);
// alt.:
// const http = require('http');
// const server = http.Server(app);

/** socket.io = the server part of Socket.IO.
 * The server integrates with (or mounts on) the Node.JS HTTP Server.
 * Initiation of a new instance of socket.io, server(= the HTTP object) is passed as an argument):
 */
const io = require('socket.io')(server, {
    /** https://stackoverflow.com/questions/59749021/socket-io-error-access-to-xmlhttprequest-
    * has-been-blocked-by-cors-policy:
    */
    cors: {
        // Below origin to be used when developing locally:
        // origin: 'http://localhost:4200',
        // Below origin to be used on production server i e on Debian:
        origin: 'https://me-angular.ktibe.me',
        methods: ['GET', 'POST']
    }
});

// Below port to be used when developing locally:
// const port = 3000;
// Below port to be used on production server i e on Debian:
const port = 8300;
let users = {};
var timeSent;

// Definition of a route handler '/':
app.get('/', (req, res) => {
    res.json({
        data: {
            msg: "Got a GET request, sending back default 200"
        }
    });
});


// the server instance of socket.io is Listening on the connection event for incoming sockets:
io.on('connection', function(socket) {
// alt.:
// io.on('connection', (socket) => {
    // console.info("socket-objektet från server.js: ", socket);
    console.info("User connected");
    console.info("socket.id från server.js: ", socket.id);

    const Chat = require('./db/chatSchema.js');
    const connect = require('./db/dbconnection.js');

    // the value of socket.id is added as a property with value/attribute "" in object users:
    users[socket.id] = "";
    // alt below I think:
    // users.socket.id = "";

    console.info("users från server.js: ", users);

    let result;

    socket.on('getAllMessages', function() {
    // alt.:
    // socket.on('getAllMessages', () => {

        console.log("socket.id från server.js getAllMessages: ", socket.id);
        console.log('Hej fån getAllMessages i server.js');

        connect
            // .then(function(db) { // eslint unused variabel db
            .then(function() {
                Chat.find({}) // Chat = the constant that refers to the model(/class) Chatmessage
                    .then(function(chat) {
                        // res.json(chat);
                        console.log("chat från server.js getAllMessages: ", chat);
                        result = chat;
                        console.log("result från getAllMessages i server.js: ", result);
                        io.to(socket.id).emit('all messages', result);
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            // });
            })
            .catch(function(err) {
                console.log('Connection to the server and database failed. Error: ' + err);
            });
    });


    socket.on('join', function(data) {
    // alt.:
    // socket.on('join', (data) => {
        users[socket.id] = data.user;
        // alt below I think:
        // users.socket.id = data.user;

        console.log("users[socket.id] från event join i server.js: ", users[socket.id]);
        console.log("users från join i server.js: ", users);
        // alt below I think:
        // console.log("users.socket.id från event join i server.js: ", users.socket.id);

        socket.join(data.room); // ????

        timeSent = new Date(); // iso-format: 2020-12-11T13:55:23.763Z
        console.log("typeof timeSent: ", typeof timeSent);

        console.log("timeSent från event join i server.js: ", timeSent);
        // var timeStampGetTime = new Date().getTime();
        //
        // console.log("TimeStampGetTime från event join i server.js: ", timeStampGetTime);

        io.emit('new user joined', {user: data.user,
            message: 'has joined room',
            timeStamp: timeSent});

        // Below code if event 'new user joined' is to be emitted to all connected sockets but
        // the one that just joined:
        // socket.broadcast.emit('new user joined', {user: data.user, message: 'has joined room'});
    });

    socket.on('leave', function(data) {
    // alt.:
    // socket.on('leave', (data) => {
        timeSent = new Date(); // iso-format: 2020-12-11T13:55:23.763Z
        io.emit('left room', {user: data.user, message: 'has left room', timeStamp: timeSent});
        // socket.broadcast.emit('left room', {user: data.user, message: 'has joined room'});
        socket.leave(data.room);
        console.log("users från event leave i server.js: ", users);
    });

    socket.on('message', function(data) {
    // alt.:
    // socket.on('message', (data) => {
        console.log("message från server.js: ", data);
        timeSent = new Date(); // iso-format: 2020-12-11T13:55:23.763Z
        // io.in(data.room).emit('new-message', {user: data.user, message: data.message});

        io.emit('new-message', {user: data.user, message: data.message, timeStamp: timeSent});

        // // save chat to the database:
        // connect.then(db  =>  { // eslint unused variabel db
        // connect.then(  =>  {
        // console.log("connected correctly to the server");
        //
        // let chatMessage = new Chat({user: data.user,
        // message: data.message, timeStamp: timeSent});
        // chatMessage.save();
        // });
        // // alt.:
        // copy save chat to the database:
        connect
            // .then(function(db) { // eslint unused variabel db
            .then(function() {
                console.log('Succesfully connected to the server and database!');

                // Chat = the constant that refers to the model(/class) Chatmessage:
                let chatMessage = new Chat({user: data.user,
                    message: data.message, timeStamp: timeSent});

                // chatMessage.save();
                chatMessage.save(function(err) {
                    if (err) {
                        console.log('The message could not be saved in the database');
                    }
                });
            })
            .catch(function(err) {
                console.log('Connection to the server and database failed. Error: ' + err);
            });
    });

    // This event is triggered when browser tab is closed:
    socket.on('disconnect', function() {
    // alt.:
    // socket.on('disconnect', () => {
        console.log("User disconnected");
        console.log("socket with socket.id " + socket.id + " is disconnected");
    });
});

server.listen(port, () => {
    console.log(`Listening on port *: ${port}`);
});
