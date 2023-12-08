import bcrypt from "bcryptjs";

import User from "../models/user.js";
import ApiException from "../exceptions/api.js";
import tokensService from "./tokens.js";
import usersService from "./users.js";
import FullUserDTO from "../dtos/fullUser.js";

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
      chats: [],
    });
    return createdUser;
  }

  async login(username: string) {
    const user = await User.findOne({ username });
    return user;
  }

  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw ApiException.unauthorized();
    }
    const payload = tokensService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokensService.findToken(refreshToken);
    if (typeof payload === "string" || !tokenFromDB) {
      throw ApiException.unauthorized();
    }
    const user = await usersService.getOne(payload.user.id);
    const tokens = tokensService.create(new FullUserDTO(user));
    return tokens.accessToken;
  }
}
const authService = new AuthService();

export default authService;
