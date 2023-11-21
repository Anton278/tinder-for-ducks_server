import mongoose from "mongoose";

export interface IUser {
  username: string;
  password: string;
  duck: {
    images: string[];
    description: string;
  };
  liked: string[];
  disliked: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  duck: {
    images: [String],
    description: { type: String, required: true },
  },
  liked: [String],
  disliked: [String],
});

const User = mongoose.model("User", userSchema);

export default User;
