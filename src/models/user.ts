import mongoose from "mongoose";

import { Notification } from "../types/notification";

export interface IUser {
  email: string;
  username: string;
  password: string;
  duck: {
    images: string[];
    description: string;
  };
  liked: string[];
  disliked: string[];
  matchs: string[];
  newMatchs: string[];
  notifications: {
    old: Notification[];
    new: Notification[];
  };
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  duck: {
    images: [String],
    description: { type: String, required: true },
  },
  liked: [String],
  disliked: [String],
  matchs: [String],
  newMatchs: [String],
  notifications: {
    old: [{}],
    new: [{}],
  },
});

const User = mongoose.model("User", userSchema);

export default User;
