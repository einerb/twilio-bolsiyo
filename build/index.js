"use strict";
exports.__esModule = true;
var express = require("express");
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", function (req, res) {
    res.status(200).json({
        message: "\uD83D\uDE80 API TWILIO!",
        data: "Doc Twilio"
    });
});
app.post("/send-message", function (req, res) {
    var data = req.body;
    if (!data.agent || !data.message || !data.numberClient || !data.type)
        res.status(400).json({ message: "No hay data para enviar!", data: null });
    if (typeof data.numberClient !== "object")
        res
            .status(400)
            .json({ message: "Debe enviar un array de numeros!", data: null });
    var accountSid = process.env.FLEX_TWILIO_ACCOUNT_SID;
    var authToken = process.env.FLEX_TWILIO_AUTH_TOKEN;
    var client = require("twilio")(accountSid, authToken);
    try {
        for (var _i = 0, _a = data.numberClient; _i < _a.length; _i++) {
            var numberClient = _a[_i];
            client.messages
                .create({
                body: "Hola! Soy ".concat(data.agent, ", ").concat(data.message),
                from: "".concat(data.type, ":+5713289008"),
                to: "".concat(data.type, ":").concat(numberClient)
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
});
app.listen(3000, function () {
    console.log("\uD83D\uDE80 App listening on port ".concat(process.env.PORT, "!"));
});
