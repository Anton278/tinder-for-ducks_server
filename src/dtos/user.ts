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
}

class UserDTO implements IUserDTO {
  username;
  duck;
  id;
  liked;
  disliked;

  constructor(user: HydratedDocument<IUser>) {
    this.username = user.username;
    this.duck = user.duck;
    this.id = user._id;
    this.liked = user.liked;
    this.disliked = user.disliked;
  }
}

export default UserDTO;
