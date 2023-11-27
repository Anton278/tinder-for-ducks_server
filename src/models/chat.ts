import mongoose from "mongoose";

interface Message {
  authorId: string;
  message: string;
}

export interface IChat {
  messages: Message[];
  users: string[];
}

const chatSchema = new mongoose.Schema<IChat>({
  messages: [{}],
  users: [String],
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
