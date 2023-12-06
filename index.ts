import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./src/routers/auth.js";
import usersRouter from "./src/routers/users.js";
import chatsRouter from "./src/routers/chats.js";
import errorMiddleware from "./src/middlewares/error.js";
import addFakeUsers from "./src/utils/addFakeUsers.js";
import startWsServer from "./src/utils/startWsServer.js";

const app = express();

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

function startHttpServer() {
  const port = process.env.PORT ? +process.env.PORT : 5000;
  app.listen(port, () => {
    console.log("Server started on port " + port);
  });
}

async function startApp() {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not present");
    }
    await mongoose.connect(process.env.MONGODB_URL);
    await addFakeUsers();
    startHttpServer();
    startWsServer();
  } catch (err) {
    console.log(err);
  }
}

startApp();
