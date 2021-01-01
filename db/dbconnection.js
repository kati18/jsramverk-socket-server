/**
 * A cleaned-up and validated copy of dbconnection_copy.js
 *
 * Below code from:
 * https://dev.to/rexeze/how-to-build-a-real-time-chat-app-with-nodejs-socketio-and-mongodb-2kho
 */
"use strict";

const mongoose = require("mongoose");

// mongoose.Promise = require("bluebird"); // does not seem to be needed
const url = "mongodb://localhost:27017/chat";
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true});

module.exports = connect;
