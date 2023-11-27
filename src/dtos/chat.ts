import { HydratedDocument, Types } from "mongoose";
import { IChat } from "../models/chat";

export interface IChatDTO extends IChat {
  id: Types.ObjectId;
}
class ChatDTO implements IChatDTO {
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
