import * as express from "express";

import { Response } from "../interfaces";

export default class MessageController {
  public path = "/send-message";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.post(this.path, this.sendMessage);
  }

  public sendMessage(req: express.Request, res: express.Response) {
    var data: Response = req.body;

    if (!data.channel)
      res.status(400).json({ message: "No hay canal de envio!", data: null });

    if (typeof data.user !== "object")
      res
        .status(400)
        .json({ message: "Debe enviar un array de usuarios!", data: null });

    const accountSid = process.env.FLEX_TWILIO_ACCOUNT_SID;
    const authToken = process.env.FLEX_TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);

    try {
      for (const user of data.user) {
        client.messages
          .create({
            body: `¡Hola! ${user.name}, bienvenido a la comunidad Bolsiyo, soy Vale, tu asistente personal.`,
            from: `${data.channel}:+5713289008`,
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
      res.status(500).json({ message: err, data: null });
    }
  }
}
