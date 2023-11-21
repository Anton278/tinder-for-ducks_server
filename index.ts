import "dotenv/config";
import express from "express";
import mongoose, { HydratedDocument } from "mongoose";
import fileUpload from "express-fileupload";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import authRouter from "./src/routers/auth.js";
import usersRouter from "./src/routers/users.js";
import errorMiddleware from "./src/middlewares/error.js";
import usersService from "./src/services/users.js";
import User, { IUser } from "./src/models/user.js";
import { GetRandomDuck } from "./src/types/responses/getRandomDuck.js";

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

app.use(errorMiddleware);

class FakeUser implements IUser {
  username;
  password;
  duck;
  liked: string[];
  disliked: string[];

  constructor(image: string) {
    this.username = uuidv4();
    this.password = "123";
    this.duck = {
      images: [image],
      description: "Generated on server",
    };
    this.liked = [];
    this.disliked = [];
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
  } catch (err) {
    console.log(err);
  }
}

startApp();
