import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";
import filesController from "../controllers/files.js";

const filesRouter = Router();

filesRouter.get("/", authMiddleware, filesController.getAll);

export default filesRouter;
