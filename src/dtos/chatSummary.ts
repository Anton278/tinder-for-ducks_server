import { HydratedDocument, Types } from "mongoose";
import { IChat } from "../models/chat";

class ChatSummaryDTO {
  users;
  lastMessage;
  unreadMessagesCount;

  constructor(chat: HydratedDocument<IChat>) {
    this.users = chat.users;
    this.lastMessage = chat.messages[0];
    this.unreadMessagesCount = chat.messages.reduce(
      (acc, { isRead }) => (isRead ? acc : acc + 1),
      0
    );
  }
}

export default ChatSummaryDTO;
