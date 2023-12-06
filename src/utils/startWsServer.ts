import { WebSocketServer } from "ws";

import chatsController from "../controllers/chats";
import chatsService from "../services/chats";
import { Message } from "../types/message";

const wssPort = process.env.WSS_PORT ? +process.env.WSS_PORT : 5001;
const wss = new WebSocketServer({
  port: wssPort,
});

// const message = {
//   event: "send-message",
//   message: "test message",
//   authorId: // ...
//   chatId: ""
// };

export default function startWsServer() {
  wss.on("connection", (ws, req) => {
    console.log("req ", req);

    ws.on("error", (err) => console.log(err));
    // @ts-expect-error
    ws.lastHeartbeat = new Date().toISOString();

    ws.on("message", async (msg) => {
      const data = JSON.parse(msg.toString()) as Message;
      console.log("received message ", data);

      if (data.event === "heartbeat" && data.message === "ping") {
        // @ts-expect-error
        ws.lastHeartbeat = new Date().toISOString();
        ws.send(JSON.stringify({ event: "heartbeat", message: "pong" }));
        return;
      }

      if (data.event === "ack") {
        //@ts-expect-error
        ws.sendAck = true;
      }

      if (data.event === "subscribe") {
        if (!data.uid || !data.chatIds) {
          return ws.send(JSON.stringify("uid or chatIds absent"));
        }
        const chats = await Promise.all(
          data.chatIds.map((chatId) => chatsService.getOne(chatId))
        );
        const userChats = chats.filter((chat) => chat.users.includes(data.uid));
        // @ts-ignore
        ws.chatIds = userChats.map((userChat) => userChat.id);
      }

      if (data.event === "get-messages") {
        // type GetChatMessage = {
        //   event: "send-message";
        //   uid: string;
        //   chatId: string;
        //   messagesPerPage?: number;
        //   page?: number;
        // };
        if (!data.uid || !data.chatId) {
          return ws.send(JSON.stringify("absent authorId or chatId"));
        }
        // @ts-expect-error
        if (!ws.chatId) {
          // @ts-expect-error
          ws.chatId = data.chatId;
        }
        try {
          const messages = await chatsController.getOne(data.chatId, data.uid, {
            mesagesPerPage: data.messagesPerPage,
            page: data.page,
          });
          ws.send(JSON.stringify({ event: "get-messages", ...messages }));
        } catch (err) {
          ws.send("Failed to get chat");
        }
        return;
      }

      if (data.event === "send-message") {
        if (!data.message || !data.authorId || !data.chatId) {
          return ws.send("message does not meet expected shape");
        }
        // @ts-expect-error
        if (!ws.chatId) {
          // @ts-expect-error
          ws.chatId = data.chatId;
        }

        // set that server didn't receive ack messages
        wss.clients.forEach((client) => {
          // @ts-expect-error
          if (client.chatId === ws.chatId) {
            //@ts-expect-error
            ws.sendAck = false;
          }
        });

        try {
          await chatsController.addMessage(data.chatId, {
            authorId: data.authorId,
            message: data.message,
          });
          const id = setInterval(() => {
            let ackMessagesCount = 0;
            wss.clients.forEach((client) => {
              // @ts-expect-error
              if (client.sendAck) {
                return (ackMessagesCount += 1);
              }
              // @ts-expect-error
              if (client.chatId === ws.chatId) {
                client.send(JSON.stringify(data));
              }
            });
            if (ackMessagesCount === 2) {
              clearInterval(id);
            }
          }, 1000);
        } catch (err) {
          ws.send("failed to save message");
        }
        return;
      }

      return ws.send("event is not recognized");
    });
  });

  const heartbeatTimeout = process.env.HEARTBEAT_TIMEOUT
    ? +process.env.HEARTBEAT_TIMEOUT
    : 40000;
  setInterval(() => {
    wss.clients.forEach((client) => {
      // @ts-expect-error
      const diff = (Date.now() - Date.parse(client.lastHeartbeat)) / 1000;
      if (diff >= heartbeatTimeout / 1000) {
        // not alive connection
        client.close();
      }
    });
  }, heartbeatTimeout);
}
