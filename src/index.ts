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

  if (!data.agent || !data.message || !data.numberClient || !data.type)
    res.status(400).json({ message: "No hay data para enviar!", data: null });

  if (typeof data.numberClient !== "object")
    res
      .status(400)
      .json({ message: "Debe enviar un array de numeros!", data: null });

  const accountSid = process.env.FLEX_TWILIO_ACCOUNT_SID;
  const authToken = process.env.FLEX_TWILIO_AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);

  try {
    for (const numberClient of data.numberClient) {
      client.messages
        .create({
          body: `Hola! Soy ${data.agent}, ${data.message}`,
          from: `${data.type}:+5713289008`,
          to: `${data.type}:${numberClient}`,
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
