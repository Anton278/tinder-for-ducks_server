import { UserT } from "../models/user";

class UserDTO {
  username;
  duck;
  id;

  constructor(user: UserT & { _id: string; _v: string }) {
    this.username = user.username;
    this.duck = user.duck;
    this.id = user._id;
  }
}

export default UserDTO;
