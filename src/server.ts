import App from "./app";
import MessageController from "./controllers/send-message.controller";

const app = new App([new MessageController()], process.env.PORT);

app.listen();
