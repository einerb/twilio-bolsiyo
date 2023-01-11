import * as express from "express";
import axios from "axios";

import HttpException from "../exceptions/httpException";
import cacheInit from "../middlewares/cache.middleware";
import { User, States } from "../interfaces";
import moment = require("moment-timezone");

export default class UserController {
  public pathGetUserInfo = "/user-info";
  public pathGetUser = "/users";
  public pathGetDashboard = "/dashboard";
  public pathGetSegment = "/segment";
  public pathGetUserSegment = "/user-events";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
    moment.locale("es");
  }

  public intializeRoutes() {
    this.router.get(this.pathGetUserInfo, cacheInit, this.getUserInfo);
    this.router.get(this.pathGetUser, cacheInit, this.getUsers);
    this.router.get(this.pathGetDashboard, cacheInit, this.getDashboard);
    this.router.get(this.pathGetSegment, cacheInit, this.getSegment);
    this.router.get(this.pathGetUserSegment, cacheInit, this.getUserEvents);
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
          let dateFromObjectId = function (objectId) {
            return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
          };
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
              createdAt: moment(dateFromObjectId(element.id))
                .tz("America/Bogota")
                .format("LLLL"),
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

  /* Mix Panel */
  public async getDashboard(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const options = {
      method: "GET",
      url: "https://mixpanel.com/api/app/workspaces/3319977/dashboards",
      headers: {
        accept: "application/json",
        authorization:
          "Basic RWluZXIuNWY3NmNhLm1wLXNlcnZpY2UtYWNjb3VudDpiUzFmd3ZaMTFBVVVuWGdRaVVxbm8wZkM4VG9hNzBnNw==",
      },
    };

    await axios.request(options).then((response: any) => {
      let dashboard = [];
      response.data.results.forEach((element: any, index: number) => {
        dashboard.push({
          id: index + 1,
          dashboardId: element.id,
          name: element.title,
        });
      });

      res.status(200).json({
        status: 200,
        message: `🚀 Dashboard encontrados`,
        data: {
          boards: dashboard,
        },
      });
    });
  }

  public async getSegment(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const dashboardId = req.query.dashboardId;
    if (!dashboardId) {
      next(
        new HttpException(
          400,
          "Debe proporcionar el parámetro dashboardId",
          null
        )
      );
    }

    const options = {
      method: "GET",
      url: `https://mixpanel.com/api/app/workspaces/3319977/dashboards/${dashboardId}`,
      headers: {
        accept: "application/json",
        authorization:
          "Basic RWluZXIuNWY3NmNhLm1wLXNlcnZpY2UtYWNjb3VudDpiUzFmd3ZaMTFBVVVuWGdRaVVxbm8wZkM4VG9hNzBnNw==",
      },
    };

    await axios.request(options).then((response: any) => {
      const data = response.data.results;
      let contents = data.contents.report;
      let segments = [];
      for (const [index, [key, value]] of Object.entries(
        Object.entries(contents)
      )) {
        segments.push({
          id: parseInt(index) + 1,
          bookmarkId: value["id"],
          name: value["name"],
        });
      }

      if (data) {
        const segment = {
          id: data.id,
          dashboard: data.title,
          segments: segments,
        };
        res.status(200).json({
          status: 200,
          message: `🚀 Segmento encontrado`,
          data: segment,
        });
      }
    });
  }

  public async getUserEvents(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const bookmarkId = req.query.bookmarkId;

    if (!bookmarkId) {
      next(
        new HttpException(
          400,
          "Debe proporcionar el parámetro bookmarkId",
          null
        )
      );
    }

    const options = {
      method: "GET",
      url: `https://mixpanel.com/api/2.0/insights?project_id=2785145&bookmark_id=${bookmarkId}`,
      headers: {
        accept: "application/json",
        authorization:
          "Basic RWluZXIuNWY3NmNhLm1wLXNlcnZpY2UtYWNjb3VudDpiUzFmd3ZaMTFBVVVuWGdRaVVxbm8wZkM4VG9hNzBnNw==",
      },
    };

    await axios.request(options).then((response: any) => {
      const data = response.data.series;

      const user = [];

      for (const [index, [key, value]] of Object.entries(
        Object.entries(data)
      )) {
        user.push({
          id: parseInt(index) + 1,
          //name: value[key][value],
          cellphone: value[parseInt(index)],
        });
      }

      if (data) {
        res.status(200).json({
          status: 200,
          message: `🚀 usuarios encontrados del segmento`,
          data: {
            users: data,
          },
        });
      }
    });
  }
}
