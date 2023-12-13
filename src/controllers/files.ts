import type { NextFunction, Request, Response } from "express";

import filesService from "../services/files";
import FileDTO from "../dtos/file";

class FilesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-expect-error
      const { uid } = req.user;
      const files = await filesService.getAll();
      const userFiles = files.filter((file) => file.ownerId === uid);
      const userFileDTOs = userFiles.map((userFile) => new FileDTO(userFile));
      res.status(200).json(userFileDTOs);
    } catch (err) {
      next(err);
    }
  }
}

const filesController = new FilesController();

export default filesController;
