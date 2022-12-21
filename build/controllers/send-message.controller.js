"use strict";
exports.__esModule = true;
var express = require("express");
var send_message_dto_1 = require("../dto/send-message.dto");
var httpException_1 = require("../exceptions/httpException");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var MessageController = /** @class */ (function () {
    function MessageController() {
        this.path = "/send-message";
        this.router = express.Router();
        this.intializeRoutes();
    }
    MessageController.prototype.intializeRoutes = function () {
        this.router.post(this.path, (0, validation_middleware_1["default"])(send_message_dto_1["default"]), this.sendMessage);
    };
    MessageController.prototype.sendMessage = function (req, res, next) {
        var data = req.body;
        var accountSid = process.env.FLEX_TWILIO_ACCOUNT_SID;
        var authToken = process.env.FLEX_TWILIO_AUTH_TOKEN;
        var client = require("twilio")(accountSid, authToken);
        try {
            for (var _i = 0, _a = data.user; _i < _a.length; _i++) {
                var user = _a[_i];
                client.messages
                    .create({
                    body: "\u00A1Hola! ".concat(user.name, ", bienvenido a la comunidad Bolsiyo, soy Vale, tu asistente personal."),
                    from: "".concat(data.channel, ":+5713289008"),
                    mediaUrl: "https://raw.githubusercontent.com/dianephan/flask_upload_photos/main/UPLOADS/DRAW_THE_OWL_MEME.png",
                    to: "".concat(data.channel, ":").concat(user.phone)
                })
                    .then(function (message) {
                    res.status(200).json({
                        message: "\uD83D\uDE80 Mensaje enviado con ID: ".concat(message.sid),
                        data: message
                    });
                });
            }
        }
        catch (err) {
            next(new httpException_1["default"](500, err, null));
        }
    };
    return MessageController;
}());
exports["default"] = MessageController;
