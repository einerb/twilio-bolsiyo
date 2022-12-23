import * as express from "express";
import axios from "axios";

import HttpException from "../exceptions/httpException";

export default class UserController {
  public pathGetUserInfo = "/user-info";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.pathGetUserInfo, this.filterUserInfo);
  }

  public async filterUserInfo(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    let cellPhone = req.query.cellphone;

    if(!cellPhone) next(new HttpException(400, "Debe proporcionar el parámetro cellphone", null));

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
}
