import * as express from "express";
import axios from "axios";
import * as util from "util";
//const mixpanel = require("mixpanel").init("b08a063550d91084d8ac29a23ef304da");
const mixpanel = require("../services/mixpanel.service");

import HttpException from "../exceptions/httpException";
import cacheInit from "../middlewares/cache.middleware";

export default class UserController {
  public pathGetUserInfo = "/user-info";
  public pathGetEvents = "/user-events";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.pathGetUserInfo, cacheInit, this.filterUserInfo);
    this.router.post(this.pathGetEvents, this.getEvents);
  }

  public async filterUserInfo(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    let cellPhone = req.query.cellphone;

    if (!cellPhone)
      next(
        new HttpException(400, "Debe proporcionar el parámetro cellphone", null)
      );

    try {
      const api = process.env.USER_API;
      const customHeaders = {
        "api-key-authorization-return": process.env.USER_API_KEY,
      };
      await axios
        .get(api, { headers: customHeaders })
        .then((response: any) => {
          if (response.data.length === 0)
            next(new HttpException(500, "No hay usuarios!", null));

          const data = response.data.filter(
            (x) => x.cellPhone === `+${cellPhone}`
          );

          res.status(200).json({
            message: `🚀 Usuario encontrado`,
            data: data.length > 0 ? data[0] : null,
          });
        })
        .catch((error) => {
          next(new HttpException(500, error, null));
        });
    } catch (err) {
      next(new HttpException(500, err, null));
    }
  }

  public async getEvents(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    let eventName = req.body.eventName;

    try {
      const options = {
        method: "POST",
        url: "https://api.mixpanel.com/track",
        headers: { accept: "text/plain", "content-type": "application/json" },
        data: [
          {
            properties: { token: "b08a063550d91084d8ac29a23ef304da" },
            event: eventName,
          },
        ],
      };

      await axios
        .request(options)
        .then(function (response) {
          res.status(200).json({
            message: `🚀 Eventos encontrados`,
            data: response.data,
          });
        })
        .catch((error) => {
          next(new HttpException(500, error, null));
        });
    } catch (err) {
      next(new HttpException(500, err, null));
    }
  }
}
