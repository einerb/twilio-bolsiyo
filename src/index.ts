import express = require("express");
import { Response } from "./interfaces/";

const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    message: `🚀 API TWILIO!`,
    data: "Doc Twilio",
  });
});

app.post("/send-message", (req, res) => {
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
});

app.listen(3000, function () {
  console.log(`🚀 App listening on port ${process.env.PORT}!`);
});
