import "dotenv/config";
import express from "express";
import mongoose, { HydratedDocument } from "mongoose";
import fileUpload from "express-fileupload";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { WebSocketServer } from "ws";

import authRouter from "./src/routers/auth.js";
import usersRouter from "./src/routers/users.js";
import chatsRouter from "./src/routers/chats.js";
import errorMiddleware from "./src/middlewares/error.js";
import usersService from "./src/services/users.js";
import User, { IUser } from "./src/models/user.js";
import { GetRandomDuck } from "./src/types/responses/getRandomDuck.js";
import chatsController from "./src/controllers/chats.js";

const app = express();
const wssPort = process.env.WSS_PORT ? +process.env.WSS_PORT : 5001;
const wss = new WebSocketServer({
  port: wssPort,
});

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(express.static("public"));
app.use(fileUpload({}));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/chats", chatsRouter);

app.use(errorMiddleware);

class FakeUser {
  username;
  password;
  duck;
  liked: string[];
  disliked: string[];
  matchs: string[];
  newMatchs: string[];

  constructor(image: string) {
    this.username = uuidv4();
    this.password = "123";
    this.duck = {
      images: [image],
      description: "Generated on server",
    };
    this.liked = [];
    this.disliked = [];
    this.matchs = [];
    this.newMatchs = [];
  }
}

function checkFakeUsersAdded(users: HydratedDocument<IUser>[]): boolean {
  let isFakeUsersAdded = false;
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    for (let j = 0; j < user.duck.images.length; j++) {
      if (user.duck.images[j].includes("random-d.uk")) {
        isFakeUsersAdded = true;
        break;
      }
    }
    if (isFakeUsersAdded) {
      break;
    }
  }
  return isFakeUsersAdded;
}

async function addFakeUsers() {
  console.log("adding fake users...");
  const randomDucks = await Promise.all(
    Array.from(Array(5)).map(() =>
      axios.get<GetRandomDuck>("https://random-d.uk/api/v2/random")
    )
  );
  await Promise.all(
    randomDucks.map((randomDuck) => {
      const fakeUser = new FakeUser(randomDuck.data.url);
      return User.create(fakeUser);
    })
  );
}

async function startApp() {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not present");
    }
    await mongoose.connect(process.env.MONGODB_URL);
    const users = await usersService.getAll();
    if (!users.length) {
      await addFakeUsers();
    } else {
      const isFakeUsersAdded = checkFakeUsersAdded(users);
      if (!isFakeUsersAdded) {
        await addFakeUsers();
      }
    }
    console.log("fake users added");
    const port = process.env.PORT ? +process.env.PORT : 5000;
    app.listen(port, () => console.log("Server started on port " + port));

    wss.on("connection", (ws) => {
      ws.on("error", (err) => console.log(err));

      // @ts-expect-error
      ws.lastHeartbeat = new Date().toISOString();

      ws.on("message", async (msg) => {
        const data = JSON.parse(msg.toString());

        if (data.event === "heartbeat" && data.message === "ping") {
          // @ts-expect-error
          ws.lastHeartbeat = new Date().toISOString();
          ws.send(JSON.stringify({ event: "heartbeat", message: "pong" }));
          return;
        }

        if (data.event === "send-message") {
          if (!data.message || !data.authorId || !data.chatId) {
            return ws.send("message does not meet expected shape");
          }
          // @ts-expect-error
          if (!ws.chatId || !ws.authorId) {
            // @ts-expect-error
            ws.chatId = data.chatId;
            // @ts-expect-error
            ws.authorId = data.authorId;
          }

          try {
            await chatsController.addMessage(data.chatId, {
              authorId: data.authorId,
              message: data.message,
            });
            wss.clients.forEach((client) => {
              if (
                // @ts-expect-error
                client.chatId === ws.chatId &&
                // @ts-expect-error
                client.authorId !== ws.authorId
              ) {
                client.send(JSON.stringify(data));
              }
            });
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
  } catch (err) {
    console.log(err);
  }
}

// const message = {
//   event: "send-message",
//   message: "test message",
//   authorId: // ...
//   chatId: ""
// };

startApp();
