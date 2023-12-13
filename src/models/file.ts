import mongoose from "mongoose";

export interface IFile {
  name: string;
  ownerId: mongoose.Types.ObjectId;
}

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const File = mongoose.model("File", fileSchema);

export default File;
