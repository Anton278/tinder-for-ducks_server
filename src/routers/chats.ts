import type { Request } from "express";

import chatsController from "../controllers/chats";

const chatsRouter = (ws: WebSocket, req: Request, msg: any) => {
  switch (msg.method) {
    case "CREATE":
      chatsController.create(ws, msg.users);
      break;
    default:
      ws.send(JSON.stringify({ message: "method value is not recognized" }));
  }
};

export default chatsRouter;
