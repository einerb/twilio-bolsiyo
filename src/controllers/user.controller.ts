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
  public pathGetUser = "/users";
  public pathGetEvents = "/user-events";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
    moment.locale("es");
  }

  public intializeRoutes() {
    this.router.get(this.pathGetUserInfo, cacheInit, this.getUserInfo);
    this.router.get(this.pathGetUser, cacheInit, this.getUsers);
    this.router.post(this.pathGetEvents, this.getEvents);
  }

  public async getUserInfo(
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
      const api = `${process.env.USER_API}/v1/users/${cellPhone}`;
      const customHeaders = {
        "api-key": process.env.USER_API_KEY,
      };
      await axios
        .get(api, { headers: customHeaders })
        .then((response: any) => {
          let data = response.data.data;
          let dateFromObjectId = function (objectId) {
            return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
          };
          let stateRegister: States;
          let createdAt = moment(dateFromObjectId(data["user"].id));

          if (!data["user"].cellPhoneVerified) stateRegister = States.CELLPHONE;
          else if (!data["user"].isComplete) stateRegister = States.COMPLETE;
          else stateRegister = States.VERIFIED;

          const user: User = {
            id: data["user"].id ?? null,
            bolsiyoId: data["user"].bolsiyoId ?? null,
            username: data["user"].username ?? null,
            email: data["user"].email ?? null,
            business: data["business"]?.name ?? null,
            country: data["country"]?.name ?? null,
            name: data["user"].name ?? null,
            lastName: data["user"].lastName ?? null,
            docType: data["user"].docType ?? null,
            docNumber: data["user"].docNumber ?? null,
            expeditionDate: data["user"].expeditionDate ?? null,
            cellPhone: data["user"].cellPhone ?? null,
            profileImage: data["user"].profileImage ?? null,
            smallThumbnail: data["user"].smallThumbnail ?? null,
            mediumThumbnail: data["user"].mediumThumbnail ?? null,
            largeThumbnail: data["user"].largeThumbnail ?? null,
            address: data["user"].address ?? null,
            createdAt: createdAt.tz("America/Bogota").format("LLLL"),
            phoneNumber: data["user"].phoneNumber ?? null,
            cellPhoneVerified: data["user"].cellPhoneVerified ?? false,
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
          res.status(404).json({
            status: 404,
            message: `Usuario no encontrado`,
            data: error.message,
          });
        });
    } catch (err) {
      next(new HttpException(500, err, null));
    }
  }

  public async getUsers(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      const api = `${process.env.USER_API}/users`;
      const customHeaders = {
        "api-key-authorization-return": process.env.API_KEY_AUTH,
      };
      await axios
        .get(api, { headers: customHeaders })
        .then((response: any) => {
          let data = response.data;

          let user: User[] = [];
          data.forEach((element) => {
            user.push({
              id: element.id ?? null,
              username: element.username ?? null,
              email: element.email ?? null,
              name: element.name ?? null,
              lastName: element.lastName ?? null,
              docType: element.docType ?? null,
              docNumber: element.docNumber ?? null,
              cellPhone: element.cellPhone ?? null,
            });
          });
          res.status(200).json({
            status: 200,
            message: `🚀 Usuarios encontrados`,
            data: user,
          });
        })
        .catch((error) => {
          res.status(404).json({
            status: 404,
            message: `Usuarios no encontrado`,
            data: error.message,
          });
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
