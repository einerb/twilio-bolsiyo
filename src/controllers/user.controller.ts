import * as express from "express";
import axios from "axios";
//const mixpanel = require("mixpanel").init("b08a063550d91084d8ac29a23ef304da");
const mixpanel = require("../services/mixpanel.service");

import HttpException from "../exceptions/httpException";
import cacheInit from "../middlewares/cache.middleware";
import { User, States } from "../interfaces";
import moment = require("moment-timezone");

export default class UserController {
  public pathGetUserInfo = "/user-info";
  public pathGetEvents = "/user-events";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
    moment.locale("es");
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
      const api = `${process.env.USER_API}/${cellPhone}`;
      const customHeaders = {
        "api-key": process.env.USER_API_KEY,
      };
      await axios
        .get(api, { headers: customHeaders })
        .then((response: any) => {
          let dateFromObjectId = function (objectId) {
            return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
          };
          let stateRegister: States;

          if (!response.data.data["user"].cellPhoneVerified)
            stateRegister = States.CELLPHONE;
          else if (!response.data.data["user"].isComplete)
            stateRegister = States.COMPLETE;
          else stateRegister = States.VERIFIED;

          let createdAt = moment(
            dateFromObjectId(response.data.data["user"].id)
          );

          let user: User = {
            id: response.data.data["user"].id ?? null,
            bolsiyoId: response.data.data["user"].bolsiyoId ?? null,
            username: response.data.data["user"].username ?? null,
            email: response.data.data["user"].email ?? null,
            business: response.data.data["business"]?.name ?? null,
            country: response.data.data["country"]?.name ?? null,
            name: response.data.data["user"].name ?? null,
            lastName: response.data.data["user"].lastName ?? null,
            docType: response.data.data["user"].docType ?? null,
            docNumber: response.data.data["user"].docNumber ?? null,
            expeditionDate: response.data.data["user"].expeditionDate ?? null,
            cellPhone: response.data.data["user"].cellPhone ?? null,
            profileImage: response.data.data["user"].profileImage ?? null,
            smallThumbnail: response.data.data["user"].smallThumbnail ?? null,
            mediumThumbnail: response.data.data["user"].mediumThumbnail ?? null,
            largeThumbnail: response.data.data["user"].largeThumbnail ?? null,
            address: response.data.data["user"].address ?? null,
            createdAt: createdAt.tz("America/Bogota").format("LLLL"),
            phoneNumber: response.data.data["user"].phoneNumber ?? null,
            cellPhoneVerified:
              response.data.data["user"].cellPhoneVerified ?? false,
            stateRegister: stateRegister,
            state: stateRegister === States.VERIFIED ? true : false,
          };

          res.status(200).json({
            status: 200,
            message: `🚀 Usuario encontrado`,
            data: user,
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
