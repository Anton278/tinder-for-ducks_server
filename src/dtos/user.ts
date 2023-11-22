import { HydratedDocument, Types } from "mongoose";

import { IUser } from "../models/user";

export interface IUserDTO {
  username: string;
  duck: {
    images: string[];
    description: string;
  };
  id: Types.ObjectId;
  liked: string[];
  disliked: string[];
  matchs: string[];
  newMatchs: string[];
}

class UserDTO implements IUserDTO {
  username;
  duck;
  id;
  liked;
  disliked;
  matchs;
  newMatchs;

  constructor(user: HydratedDocument<IUser>) {
    this.username = user.username;
    this.duck = user.duck;
    this.id = user._id;
    this.liked = user.liked;
    this.disliked = user.disliked;
    this.matchs = user.matchs;
    this.newMatchs = user.newMatchs;
  }
}

export default UserDTO;
