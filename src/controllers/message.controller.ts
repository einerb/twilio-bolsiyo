import * as express from "express";
import axios from "axios";

import SendMessageDto from "../dto/send-message-whatsApp.dto";
import HttpException from "../exceptions/httpException";
import validationMiddleware from "../middlewares/validation.middleware";
import { Template } from "../templates/template";
import cacheInit from "../middlewares/cache.middleware";
import { Chat, Conversation, Message } from "../interfaces/conversation.model";
import moment = require("moment-timezone");

const accountSid = process.env.FLEX_TWILIO_ACCOUNT_SID;
const authToken = process.env.FLEX_TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

export default class MessageController {
  public pathSendMessage = "/send-message";
  public pathGetTemplates = "/templates";
  public pathGetConversations = "/conversations";
  public pathGetConversationDetails = "/conversation-details";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.post(
      this.pathSendMessage,
      validationMiddleware(SendMessageDto),
      this.sendMessage
    );
    this.router.get(this.pathGetTemplates, cacheInit, this.getTemplates);
    this.router.get(
      this.pathGetConversations,
      cacheInit,
      this.getConversations
    );
    this.router.get(
      this.pathGetConversationDetails,
      cacheInit,
      this.getConversationDetails
    );
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

  public async sendMessage(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    var data = req.body;
    try {
      for (const user of data.user) {
        let templateBody = "";
        if (data.channel === "whatsapp") {
          if (!Template.find((t) => t.id === data.template)) {
            next(
              new HttpException(
                404,
                "No existe el template seleccionado!",
                null
              )
            );
          } else {
            templateBody =
              Template[data.template - 1].template.search("{{") !== -1
                ? Template[data.template - 1].template.replace(
                    "{{1}}",
                    user.name
                  )
                : Template[data.template - 1].template;
          }
        } else {
          if (!data.bodySMS) {
            next(
              new HttpException(
                404,
                "Falta agregar el cuerpo del mensaje",
                null
              )
            );
          }
          templateBody = data.bodySMS;
        }

        let dataMessage = {
          body: templateBody,
          from:
            data.channel === "whatsapp"
              ? `${data.channel}:${process.env.FLEX_TWILIO_NUMBER_MAIN_WHATSAPP}`
              : `${process.env.FLEX_TWILIO_NUMBER_MAIN_SMS}`,
          to:
            data.channel === "whatsapp"
              ? `${data.channel}:${user.phone}`
              : `${user.phone}`,
        };

        await client.messages
          .create(dataMessage)
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
    } catch (err) {
      next(new HttpException(500, err, null));
    }
  }

  public async getConversations(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const api = "https://conversations.twilio.com/v1/Conversations";

    await axios
      .get(api, {
        auth: {
          username: accountSid,
          password: authToken,
        },
      })
      .then((response: any) => {
        let data = response.data["conversations"];
        let conversation: Conversation[] = [];

        data.map((chat) => {
          conversation.push({
            id: chat.sid,
            messagingService: chat.messaging_service_sid,
            chatService: chat.chat_service_sid,
            state: chat.state,
            createdAt: moment
              .tz(chat.date_created, "America/Bogota")
              .format("LLLL"),
            updatedAt: moment
              .tz(chat.date_updated, "America/Bogota")
              .format("LLLL"),
          });
        });

        res.status(200).json({
          status: 200,
          message: `🚀 Conversaciones encontradas`,
          data: conversation,
        });
      })
      .catch((error) => {
        res.status(404).json({
          status: 404,
          message: `Conversaciones no encontradas`,
          data: error.message,
        });
      });
  }

  public getConversationDetails(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const chatId = req.query.chatId;

    const endpoints = [
      `https://conversations.twilio.com/v1/Conversations/${chatId}`,
      `https://conversations.twilio.com/v1/Conversations/${chatId}/Messages`,
      `https://conversations.twilio.com/v1/Conversations/${chatId}/Participants`,
    ];

    Promise.all(
      endpoints.map((endpoint) =>
        axios.get(endpoint, {
          auth: {
            username: accountSid,
            password: authToken,
          },
        })
      )
    )
      .then(
        ([
          { data: conversationData },
          { data: messageData },
          { data: participantData },
        ]) => {
          let messages: Message[] = [];
          let participants = {
            agent:
              participantData["participants"][0]?.identity ?? "No asignado",
            client:
              participantData["participants"][1]?.messaging_binding.address ??
              "",
          };
          messageData["messages"].forEach((msg) => {
            messages.push({
              index: msg.index,
              body: msg.body,
              author: msg.author,
              media: msg.media,
              createdAt: moment
                .tz(msg.date_created, "America/Bogota")
                .format("LLLL"),
              updatedAt: moment
                .tz(msg.date_updated, "America/Bogota")
                .format("LLLL"),
            });
          });

          let conversation: Chat = {
            id: conversationData.sid,
            agent: participants.agent,
            client: participants.client,
            state: conversationData.state,
            messages: messages,
          };

          res.status(200).json({
            status: 200,
            message: `🚀 Historial del chat`,
            data: conversation,
          });
        }
      )
      .catch((error) => {
        res.status(404).json({
          status: 404,
          message: `Conversaciones no encontradas`,
          data: error.message,
        });
      });
  }
}
