import { Router } from "express";

import authMiddleware from "../middlewares/auth";
import chatsController from "../controllers/chats";

const chatsRouter = Router();

chatsRouter.post("/", authMiddleware, chatsController.create);

export default chatsRouter;
