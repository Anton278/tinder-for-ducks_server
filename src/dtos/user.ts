import { HydratedDocument } from "mongoose";

import { IUser } from "../models/user";

class UserDTO {
  duck;
  id;

  constructor(candidate: HydratedDocument<IUser>) {
    this.duck = candidate.duck;
    this.id = candidate._id;
  }
}

export default UserDTO;
