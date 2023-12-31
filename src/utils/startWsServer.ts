import { WebSocketServer } from "ws";
import { Server } from "http";

import chatsService from "../services/chats";
import { Message } from "../types/message";
import tokensService from "../services/tokens";

export default function startWsServer(httpServer: Server) {
  httpServer.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
  });

  const wss = new WebSocketServer({
    noServer: true,
  });

  const broadcast = (chatId: string, message: any) => {
    wss.clients.forEach((client) => {
      // @ts-ignore
      if (client.chatIds.includes(chatId)) {
        client.send(JSON.stringify(message));
      }
    });
  };

  wss.on("connection", (ws, req) => {
    ws.on("error", (err) => console.log(err));

    // Authorization based on access token
    const token = req.headers["sec-websocket-protocol"];
    if (!token) {
      ws.close(1008, "Unauthorized user");
      return;
    }
    try {
      const payload = tokensService.validateAccessToken(token);
      // @ts-expect-error
      ws.isAuthed = true;
      // @ts-expect-error
      ws.uid = payload.user.id;
    } catch (err) {
      ws.close(1008, "Unauthorized user");
      return;
    }

    // @ts-expect-error
    ws.lastHeartbeat = new Date().toISOString();

    ws.on("message", async (msg) => {
      const data = JSON.parse(msg.toString()) as Message;
      console.log("received message ", data);

      if (data.event === "subscribe") {
        if (!data.chatIds || !Array.isArray(data.chatIds)) {
          ws.close(
            1002,
            JSON.stringify("chatsIds absent or not array array type")
          );
        }
        // @ts-ignore
        const userChats = await chatsService.getAll(ws.uid);
        const allowedChats = data.chatIds.filter((chatId) => {
          const chat = userChats.find((userChat) => chatId === userChat.id);
          return chat;
        });
        // @ts-ignore
        ws.chatIds = allowedChats;
        ws.send(
          JSON.stringify({
            event: "subscribe",
            success: true,
            subscribedChats: allowedChats,
          })
        );
        return;
      }

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

      // todo: add chatId and page to response
      if (data.event === "get-chat") {
        if (!data.chatId) {
          return ws.send(JSON.stringify("absent chatId"));
        }

        // @ts-ignore
        if (!ws.chatIds.includes(data.chatId)) {
          ws.close(1008, "Unauthorized user");
          return;
        }

        try {
          const res = await chatsService.getOne(
            data.chatId,
            data.page,
            data.messagesPerPage
          );
          ws.send(
            JSON.stringify({
              event: "get-chat",
              ...res,
            })
          );
        } catch (err) {
          ws.send(JSON.stringify("Failed to get chat"));
        }
        return;
      }

      if (data.event === "send-message") {
        if (!data.message || !data.chatId) {
          return ws.send(JSON.stringify("absent message or chatId"));
        }

        // set that server didn't receive ack messages
        // wss.clients.forEach((client) => {
        //   // @ts-expect-error
        //   if (client.chatId === ws.chatId) {
        //     //@ts-expect-error
        //     ws.sendAck = false;
        //   }
        // });

        try {
          const message = await chatsService.addMessage(
            data.chatId,
            data.message,
            // @ts-expect-error
            ws.uid
          );
          broadcast(data.chatId, {
            event: "sent-message",
            message,
            chatId: data.chatId,
          });
          // const id = setInterval(() => {
          //   let ackMessagesCount = 0;
          //   wss.clients.forEach((client) => {
          //     // @ts-expect-error
          //     if (client.sendAck) {
          //       return (ackMessagesCount += 1);
          //     }
          //     // @ts-expect-error
          //     if (client.chatId === ws.chatId) {
          //       client.send(JSON.stringify(data));
          //     }
          //   });
          //   if (ackMessagesCount === 2) {
          //     clearInterval(id);
          //   }
          // }, 1000);
        } catch (err: any) {
          ws.close(1011, JSON.stringify(err.message));
        }
        return;
      }

      return ws.send(JSON.stringify("event is not recognized"));
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
        // client.close();
      }
    });
  }, heartbeatTimeout);
}
