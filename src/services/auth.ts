import bcrypt from "bcryptjs";

import User from "../models/user.js";

class AuthService {
  async register(
    username: string,
    password: string,
    duck: { description: string; images: string[] }
  ) {
    const candidate = await User.findOne({ username });
    if (candidate) {
      throw new Error(`user with given username already exist`);
    }
    const hashPassword = bcrypt.hashSync(password, 7);
    const createdUser = await User.create({
      username,
      password: hashPassword,
      duck,
      liked: [],
      disliked: [],
      matchs: [],
      newMatchs: [],
      notifications: {
        old: [],
        new: [],
      },
    });
    return createdUser;
  }

  async login(username: string) {
    const user = await User.findOne({ username });
    return user;
  }
}
const authService = new AuthService();

export default authService;
