import mongoose from "mongoose";

export interface Message {
  authorId: string;
  message: string;
  id: string;
  isRead: boolean;
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
