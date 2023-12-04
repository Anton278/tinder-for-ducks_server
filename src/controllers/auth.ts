import { validationResult } from "express-validator";
import type { Response, Request, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import authService from "../services/auth.js";
import UserDTO, { IUserDTO } from "../dtos/user.js";
import tokensService from "../services/tokens.js";
import { TypedReqBody } from "../types/typedReqBody.js";
import fileService from "../services/file.js";
import usersService from "../services/users.js";
import ApiException from "../exceptions/api.js";

class AuthController {
  async register(
    req: TypedReqBody<{
      email: string;
      description: string;
      password: string;
      username: string;
    }>,
    res: Response,
    next: NextFunction
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Error on registration", errors });
    }
    try {
      if (!req.files) {
        return res.status(400).json({ message: "Files in request are absent" });
      }
      const files = Object.values(req.files).map((file) =>
        Array.isArray(file) ? file[0] : file
      );
      files.sort();
      const images = await Promise.all(
        files.map((file) => fileService.save(file))
      );

      const user = await authService.register(
        req.body.email,
        req.body.username,
        req.body.password,
        { description: req.body.description, images }
      );

      const userDTO: IUserDTO = new UserDTO(user);
      const tokens = tokensService.create(userDTO);
      await tokensService.saveToken(tokens.refreshToken, userDTO.id);
      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: process.env.NODE_ENV !== "development",
      });
      res.status(200).json({
        user: { email: req.body.email, ...userDTO },
        accessToken: tokens.accessToken,
      });
    } catch (err: any) {
      next(err);
    }
  }

  async login(
    req: TypedReqBody<{ username: string; password: string }>,
    res: Response
  ) {
    try {
      const user = await authService.login(req.body.username);
      if (!user) {
        return res.status(400).json({ message: "Wrong username or password" });
      }
      if (user.duck.description.includes("Generated on server")) {
        return res.status(403).json({ message: "" });
      }
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Wrong username or password" });
      }
      const userDTO: IUserDTO = new UserDTO(user);
      const tokens = tokensService.create(userDTO);
      await tokensService.saveToken(tokens.refreshToken, user._id);
      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: process.env.NODE_ENV !== "development",
      });
      res.status(200).json({ accessToken: tokens.accessToken, user: userDTO });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      if (!refreshTokenSecret) {
        throw new Error("REFRESH_TOKEN_SECRET env variable is undefined");
      }
      const accessTokenHeader = req.headers["access-token"];
      if (typeof accessTokenHeader !== "string") {
        return res.status(401).json({ message: "Unauthorized user" });
      }
      const accessToken = accessTokenHeader.split(" ")[1];
      if (!accessToken) {
        return res.status(400).json({
          message: 'Access token header must be format: "Bearer <token>"',
        });
      }
      const refreshToken: string | undefined = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(500).json({ message: "refreshToken is undefined" });
      }
      const user = jwt.verify(refreshToken, refreshTokenSecret) as IUserDTO;
      await tokensService.delete(user.id);
      res.clearCookie("refreshToken");
      res.status(200).json({});
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  async refreshAccessToken(req: Request, res: Response) {
    try {
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      if (!refreshTokenSecret) {
        throw new Error("REFRESH_TOKEN_SECRET env variable is undefined");
      }
      const accessTokenHeader = req.headers["access-token"];
      if (typeof accessTokenHeader !== "string") {
        return res.status(401).json({ message: "Unauthorized user" });
      }
      const accessToken = accessTokenHeader.split(" ")[1];
      if (!accessToken) {
        return res.status(400).json({
          message: 'Access token header must be format: "Bearer <token>"',
        });
      }
      const refreshToken: string | undefined = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(500).json({ message: "refreshToken is undefined" });
      }
      const user = jwt.verify(refreshToken, refreshTokenSecret) as IUserDTO;
      const tokens = tokensService.create(user);
      res.status(200).json({ accessToken: tokens.accessToken });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  async checkUsernameUniqueness(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const username = req.query.username;
      if (!username) {
        return res
          .status(400)
          .json({ message: "query parameter username is absent" });
      }
      const users = await usersService.getAll();
      const candidate = users.find((user) => user.username === username);
      if (candidate) {
        throw ApiException.userExist("username");
      }
      res.status(200).json({ message: "Given username is not taken" });
    } catch (err) {
      next(err);
    }
  }
}

const authController = new AuthController();
export default authController;
