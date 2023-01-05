import App from "./app";
import MessageController from "./controllers/message.controller";
import UserController from "./controllers/user.controller";

const app = new App(
  [new MessageController(), new UserController()],
  process.env.PORT
);

app.listen();
