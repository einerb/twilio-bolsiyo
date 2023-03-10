"use strict";
exports.__esModule = true;
var express = require("express");
var bodyParser = require("body-parser");
var error_middleware_1 = require("./middlewares/error.middleware");
var App = /** @class */ (function () {
    function App(controllers, port) {
        this.app = express();
        this.port = port;
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }
    App.prototype.initializeMiddlewares = function () {
        this.app.use(bodyParser.json());
    };
    App.prototype.initializeErrorHandling = function () {
        this.app.use(error_middleware_1["default"]);
    };
    App.prototype.initializeControllers = function (controllers) {
        var _this = this;
        controllers.forEach(function (controller) {
            _this.app.use("/", controller.router);
        });
    };
    App.prototype.listen = function () {
        var _this = this;
        this.app.listen(this.port, function () {
            console.log("\uD83D\uDE80 App listening on port ".concat(_this.port));
        });
    };
    return App;
}());
exports["default"] = App;
