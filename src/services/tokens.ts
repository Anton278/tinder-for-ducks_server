import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import Token from "../models/token.js";
import { IFullUserDTO } from "../dtos/fullUser.js";

class TokensService {
  create(user: IFullUserDTO) {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error("Absent access or refresh token secrets");
    }
    const accessToken = jwt.sign({ user }, accessTokenSecret, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign({ user }, refreshTokenSecret, {
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
}

const tokensService = new TokensService();

export default tokensService;
