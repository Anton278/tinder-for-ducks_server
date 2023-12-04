import { HydratedDocument, Types } from "mongoose";

import { IUser } from "../models/user";
import { Notification } from "../types/notification";

export interface IUserDTO {
  username: string;
  duck: {
    images: string[];
    description: string;
  };
  id: Types.ObjectId | string;
  liked: string[];
  disliked: string[];
  matchs: string[];
  newMatchs: string[];
  notifications: {
    old: Notification[];
    new: Notification[];
  };
}

class UserDTO implements IUserDTO {
  username;
  duck;
  id;
  liked;
  disliked;
  matchs;
  newMatchs;
  notifications;

  constructor(user: HydratedDocument<IUser>) {
    this.username = user.username;
    this.duck = user.duck;
    this.id = user._id;
    this.liked = user.liked;
    this.disliked = user.disliked;
    this.matchs = user.matchs;
    this.newMatchs = user.newMatchs;
    this.notifications = user.notifications;
  }
}

export default UserDTO;
