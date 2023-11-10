import { validationResult } from "express-validator";
import type { Request, Response } from "express";
import type { UploadedFile } from "express-fileupload";

import authService from "../services/auth.js";
import UserDTO from "../dtos/user.js";
import tokensService from "../services/tokens.js";
import { TypedReqBody } from "../models/typedReqBody.js";
import { UserT } from "../models/user.js";
import fileService from "../services/file.js";

class AuthController {
  async register(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Error on registration", errors });
    }
    try {
      if (!req.files) {
        throw new Error("files in request are absent");
      }
      const filesEntries = Object.entries(req.files);
      // @ts-ignore
      const singleFilesEntries: [name: string, file: UploadedFile][] =
        filesEntries.filter((fileEntry) => !Array.isArray(fileEntry[1]));
      const images = await Promise.all(
        singleFilesEntries.map((fileEntry) => fileService.save(fileEntry[1]))
      );

      const createdUser = await authService.register(
        req.body.username,
        req.body.password,
        { description: req.body.description, images }
      );
      // @ts-ignore
      const createdUserDTO = new UserDTO(createdUser);
      const tokens = tokensService.create();
      await tokensService.saveToken(tokens.refreshToken, createdUserDTO.id);
      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: process.env.MODE !== "development",
      });
      res
        .status(200)
        .json({ ...createdUserDTO, accessToken: tokens.accessToken });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}

const authController = new AuthController();
export default authController;
