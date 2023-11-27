import { HydratedDocument } from "mongoose";
import { IChat } from "../models/chat";

class ChatDTO {
  messages;
  users;
  id;

  constructor(chat: HydratedDocument<IChat>) {
    this.messages = chat.messages;
    this.users = chat.users;
    this.id = chat._id;
  }
}

export default ChatDTO;
