import * as express from "express";

import SendMessageWhatsAppDto from "../dto/send-message-whatsApp.dto";
import HttpException from "../exceptions/httpException";
import validationMiddleware from "../middlewares/validation.middleware";
import { Template } from "../templates/template";

const accountSid = process.env.FLEX_TWILIO_ACCOUNT_SID;
const authToken = process.env.FLEX_TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

export default class MessageController {
  public pathSendMessageWhatsApp = "/send-message";
  public pathGetTemplates = "/templates";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.post(
      this.pathSendMessageWhatsApp,
      validationMiddleware(SendMessageWhatsAppDto),
      this.sendMessageWhatsApp
    );
    this.router.get(this.pathGetTemplates, this.getTemplates);
  }

  public getTemplates(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    res.status(200).json({
      status: 200,
      message: `🚀 Templates aprobados`,
      data: Template ?? null,
    });
  }

  public async sendMessageWhatsApp(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    var data = req.body;
    try {
      for (const user of data.user) {
        if (!Template.find((t) => t.id === data.template)) {
          next(
            new HttpException(404, "No existe el template seleccionado!", null)
          );
        } else {
          let templateBody =
            Template[data.template - 1].template.search("{{") !== -1
              ? Template[data.template - 1].template.replace("{{1}}", user.name)
              : Template[data.template - 1].template;

          await client.messages
            .create({
              body: templateBody,
              from: `${data.channel}:${process.env.FLEX_TWILIO_NUMBER_MAIN}`,
              to: `${data.channel}:${user.phone}`,
            })
            .then((message) => {
              res.status(200).json({
                status: 200,
                message: `🚀 Mensaje enviado con ID: ${message.sid}`,
                data: message,
              });
            })
            .catch((error) => {
              next(new HttpException(500, error, null));
            });
        }
      }
    } catch (err) {
      next(new HttpException(500, err, null));
    }
  }
}
