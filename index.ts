import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./src/routers/auth.js";

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

async function startApp() {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not present");
    }
    await mongoose.connect(process.env.MONGODB_URL);
    const port = process.env.PORT ? +process.env.PORT : 5000;
    app.listen(port, () => console.log("Server started on port " + port));
  } catch (err) {
    console.log(err);
  }
}

startApp();
