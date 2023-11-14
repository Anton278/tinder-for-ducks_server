import { HydratedDocument, Types } from "mongoose";

import { IUser } from "../models/user";

export interface IUserDTO {
  username: string;
  duck: {
    images: string[];
    description: string;
  };
  id: Types.ObjectId;
}

class UserDTO implements IUserDTO {
  username;
  duck;
  id;

  constructor(user: HydratedDocument<IUser>) {
    this.username = user.username;
    this.duck = user.duck;
    this.id = user._id;
  }
}

export default UserDTO;
