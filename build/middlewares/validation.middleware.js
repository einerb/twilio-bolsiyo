"use strict";
exports.__esModule = true;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var httpException_1 = require("../exceptions/httpException");
function validationMiddleware(type) {
    return function (req, res, next) {
        (0, class_validator_1.validate)((0, class_transformer_1.plainToClass)(type, req.body)).then(function (errors) {
            if (errors.length > 0) {
                var message = errors
                    .map(function (error) { return Object.values(error.constraints); })
                    .join(", ");
                next(new httpException_1["default"](400, message, null));
            }
            else {
                next();
            }
        });
    };
}
exports["default"] = validationMiddleware;
