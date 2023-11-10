import { Router } from "express";
import { check } from "express-validator";

import authController from "../controllers/auth.js";
import { passwordRegex } from "../const.js";

const authRouter = Router();

authRouter.post(
  "/register",
  check("username").trim().notEmpty().escape().toLowerCase(),
  check("password").matches(passwordRegex).escape(),
  // check("duck.[images][0].value").notEmpty(),
  // check("duck.[description]").notEmpty(),
  authController.register
);

export default authRouter;
