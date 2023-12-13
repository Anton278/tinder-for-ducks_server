import { HydratedDocument } from "mongoose";
import { IFile } from "../models/file";

class FileDTO {
  name;
  ownerId;
  id;

  constructor(file: HydratedDocument<IFile>) {
    this.name = file.name;
    this.ownerId = file.ownerId;
    this.id = file._id;
  }
}

export default FileDTO;
