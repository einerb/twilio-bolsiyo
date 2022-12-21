"use strict";
exports.__esModule = true;
var app_1 = require("./app");
var send_message_controller_1 = require("./controllers/send-message.controller");
var app = new app_1["default"]([new send_message_controller_1["default"]()], process.env.PORT);
app.listen();
