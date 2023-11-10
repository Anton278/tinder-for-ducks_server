import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  duck: {
    images: [String],
    description: { type: String, required: true },
  },
});

const User = mongoose.model("User", userSchema);

type UserT = {
  username: string;
  password: string;
  duck: {
    images: string[];
    description: string;
  };
};

export default User;
export { UserT };
