/**
 * A cleaned-up and validated copy of chatSchema_copy.js
 *
 * Below code from:
 * https://dev.to/rexeze/how-to-build-a-real-time-chat-app-with-nodejs-socketio-and-mongodb-2kho
 */

"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const chatSchema = new Schema({
    user: { type: String },
    message: { type: String },
    timeStamp: { type: Date }
});

// The schema chatSchema is compiled into a model(/class) called Chat:
// let Chat = mongoose.model("Chat", chatSchema);
//
// module.exports = Chat;

/** The schema chatSchema is compiled into a model(/class) called Chatmessage
 * and the chatmessages instantiated from the class are saved in the collection chatmessages:
 */
let Chatmessage = mongoose.model("Chatmessage", chatSchema);

module.exports = Chatmessage;
