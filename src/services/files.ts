import type { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import mongoose from "mongoose";

import File from "../models/file";

class FilesService {
  async save(
    file: UploadedFile,
    ownerId: mongoose.Types.ObjectId,
    description?: string
  ) {
    const extension = file.name.split(".")[1];
    const name = `${uuidv4()}.${extension}`;
    file.name = name;

    const createdFile = await File.create({
      name: `${process.env.BASE_URL}/${name}`,
      ownerId,
      description,
    });

    const filePath = path.resolve("public", name);
    await file.mv(filePath);

    return createdFile;
  }

  async getAll() {
    const files = await File.find({});
    return files;
  }
}

const filesService = new FilesService();

export default filesService;
