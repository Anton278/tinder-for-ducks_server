import mongoose from "mongoose";

export interface IFile {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  description?: string;
}

const fileSchema = new mongoose.Schema<IFile>({
  name: { type: String, required: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: String,
});

const File = mongoose.model("File", fileSchema);

export default File;
