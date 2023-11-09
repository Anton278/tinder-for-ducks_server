import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

const app = express();
const port = process.env.PORT | 5000;

app.listen(port, () => {
  console.log("App running on localhost:" + port);
  mongoose.connect(process.env.MONGODB_URL).catch((err) => console.log(err));
});
