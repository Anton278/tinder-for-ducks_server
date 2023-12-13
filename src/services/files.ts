import type { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";

import File from "../models/file";

class FilesService {
  async save(file: UploadedFile) {
    const extension = file.name.split(".")[1];
    const name = `${uuidv4()}.${extension}`;
    file.name = name;
    const filePath = path.resolve("public", name);
    await file.mv(filePath);
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    return `${baseUrl}/${name}`;
  }

  async getAll() {
    const files = await File.find({});
    return files;
  }
}

const filesService = new FilesService();

export default filesService;
