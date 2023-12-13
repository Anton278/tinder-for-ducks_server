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

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-expect-error
      const { id: uid } = req.user;
      // @ts-expect-error
      console.log("req.user ", req.user);

      if (!req.files) {
        res.status(400).json({ message: "Files are absent" });
        return;
      }
      const file = Object.values(req.files)[0];
      if (Array.isArray(file)) {
        res.status(400).json({ message: "Not allowed file list" });
        return;
      }
      const createdFile = await filesService.save(
        file,
        uid,
        req.body.description
      );
      const createdFileDTO = new FileDTO(createdFile);
      res.status(200).json(createdFileDTO);
    } catch (err) {
      next(err);
    }
  }
}

const filesController = new FilesController();

export default filesController;
