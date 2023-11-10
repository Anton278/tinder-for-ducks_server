import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import Token from "../models/token.js";

class TokensService {
  create() {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error("Absent access or refresh token secrets");
    }
    const accessToken = jwt.sign({}, accessTokenSecret, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign({}, refreshTokenSecret, {
      expiresIn: "25 days",
    });
    return { accessToken, refreshToken };
  }

  async saveToken(refreshToken: string, uid: Types.ObjectId) {
    const token = await Token.findOne({ uid });
    if (token) {
      token.refreshToken = refreshToken;
      await token.save();
      return;
    }
    await Token.create({ refreshToken, uid });
  }
}

const tokensService = new TokensService();

export default tokensService;
