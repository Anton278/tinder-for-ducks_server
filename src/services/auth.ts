import bcrypt from "bcryptjs";

import User from "../models/user.js";
import ApiException from "../exceptions/api.js";

class AuthService {
  async register(
    email: string,
    username: string,
    password: string,
    duck: { description: string; images: string[] }
  ) {
    const emailCandidate = await User.findOne({ email });
    const usernameCandidate = await User.findOne({ username });
    if (emailCandidate || usernameCandidate) {
      throw ApiException.userExist(usernameCandidate ? "username" : "email");
    }
    const hashPassword = bcrypt.hashSync(password, 7);
    const createdUser = await User.create({
      email,
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
