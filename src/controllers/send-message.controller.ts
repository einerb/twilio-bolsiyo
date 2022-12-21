import * as express from "express";
import SendMessageDto from "../dto/send-message.dto";
import HttpException from "../exceptions/httpException";

import validationMiddleware from "../middlewares/validation.middleware";

export default class MessageController {
  public path = "/send-message";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.post(
      this.path,
      validationMiddleware(SendMessageDto),
      this.sendMessage
    );
  }

  public sendMessage(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    var data = req.body;

    const accountSid = process.env.FLEX_TWILIO_ACCOUNT_SID;
    const authToken = process.env.FLEX_TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);

    try {
      for (const user of data.user) {
        client.messages
          .create({
            body: `¡Hola! ${user.name}, bienvenido a la comunidad Bolsiyo, soy Vale, tu asistente personal.`,
            from: `${data.channel}:+5713289008`,
            /* mediaUrl:
              "https://raw.githubusercontent.com/dianephan/flask_upload_photos/main/UPLOADS/DRAW_THE_OWL_MEME.png", */
            to: `${data.channel}:${user.phone}`,
          })
          .then((message) => {
            res.status(200).json({
              message: `🚀 Mensaje enviado con ID: ${message.sid}`,
              data: message,
            });
          });
      }
    } catch (err) {
      next(new HttpException(500, err, null));
    }
  }
}
