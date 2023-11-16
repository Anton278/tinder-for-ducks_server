import { Router } from "express";
import { check } from "express-validator";

import authController from "../controllers/auth.js";
import { passwordRegex } from "../const.js";

const authRouter = Router();

authRouter.post(
  "/register",
  check("username").trim().notEmpty().escape().toLowerCase(),
  check("password").matches(passwordRegex).escape(),
  check("description").trim().notEmpty().escape(),
  authController.register
);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/refreshAccessToken", authController.refreshAccessToken);

export default authRouter;