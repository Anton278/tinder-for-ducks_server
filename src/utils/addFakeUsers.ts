import { HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import User, { IUser } from "../models/user";
import { GetRandomDuck } from "../types/responses/getRandomDuck";
import usersService from "../services/users";

class FakeUser {
  email;
  username;
  password;
  duck;
  liked: string[];
  disliked: string[];
  matchs: string[];
  newMatchs: string[];

  constructor(image: string) {
    this.email = uuidv4();
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

async function createFakeUsers() {
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

export default async function addFakeUsers() {
  const users = await usersService.getAll();
  if (!users.length) {
    await createFakeUsers();
  } else {
    const isFakeUsersAdded = checkFakeUsersAdded(users);
    if (!isFakeUsersAdded) {
      await createFakeUsers();
    }
  }
  console.log("fake users added");
}
