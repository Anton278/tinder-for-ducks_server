import { Router } from "express";

import usersController from "../controllers/users";
import authMiddleware from "../middlewares/auth";

const usersRouter = Router();

usersRouter.get("/", authMiddleware, usersController.getAll);
usersRouter.get("/:id", authMiddleware, usersController.getOne);
usersRouter.put("/", authMiddleware, usersController.update);

export default usersRouter;
