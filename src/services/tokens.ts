import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import Token from "../models/token.js";

class TokensService {
  create(uid: string) {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error("Absent access or refresh token secrets");
    }

    const accessToken = jwt.sign({}, accessTokenSecret, {
      expiresIn: "10m",
      subject: uid,
    });
    const refreshToken = jwt.sign({}, refreshTokenSecret, {
      expiresIn: "25 days",
      subject: uid,
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

  async delete(uid: Types.ObjectId) {
    const token = await Token.findOneAndDelete({ uid });
    return token;
  }

  validateAccessToken(accessToken: string) {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenSecret) {
      throw new Error("ACCESS_TOKEN_SECRET env variable is absent");
    }
    const payload = jwt.verify(accessToken, accessTokenSecret);
    if (typeof payload === "string") {
      throw new Error("Encountered string token payload");
    }
    return payload;
  }

  validateRefreshToken(refreshToken: string) {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshTokenSecret) {
      throw new Error("REFRESH_TOKEN_SECRET env variable is absent");
    }

    const payload = jwt.verify(refreshToken, refreshTokenSecret);
    return payload;
  }

  async findToken(token: string) {
    const tokenFromDB = Token.find({ refreshToken: token });
    return tokenFromDB;
  }
}

const tokensService = new TokensService();

export default tokensService;
