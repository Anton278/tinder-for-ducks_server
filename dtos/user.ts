import { HydratedDocument } from "mongoose";

import { IUser } from "../models/user";

class UserDTO {
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
