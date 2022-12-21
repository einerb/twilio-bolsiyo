"use strict";
exports.__esModule = true;
var express = require("express");
var MessageController = /** @class */ (function () {
    function MessageController() {
        this.path = "/send-message";
        this.router = express.Router();
        this.intializeRoutes();
    }
    MessageController.prototype.intializeRoutes = function () {
        this.router.post(this.path, this.sendMessage);
    };
    MessageController.prototype.sendMessage = function (req, res) {
        var data = req.body;
        if (!data.channel)
            res.status(400).json({ message: "No hay canal de envio!", data: null });
        if (typeof data.user !== "object")
            res
                .status(400)
                .json({ message: "Debe enviar un array de usuarios!", data: null });
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
            res.status(500).json({ message: err, data: null });
        }
    };
    return MessageController;
}());
exports["default"] = MessageController;
