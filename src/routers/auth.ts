import { Router } from "express";
import { check } from "express-validator";

import authController from "../controllers/auth.js";
import { passwordRegex } from "../const.js";
import authMiddleware from "../middlewares/auth.js";

const authRouter = Router();

authRouter.post(
  "/register",
  check("email").isEmail().notEmpty(),
  check("username").trim().notEmpty().toLowerCase(),
  check("password").matches(passwordRegex),
  check("description").trim().notEmpty(),
  authController.register
);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/refreshAccessToken", authController.refreshAccessToken);
authRouter.post(
  "/changePassword",
  authMiddleware,
  authController.changePassword
);
authRouter.get(
  "/checkUsernameUniqueness",
  authController.checkUsernameUniqueness
);

export default authRouter;
