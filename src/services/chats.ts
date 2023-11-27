import Chat from "../models/chat";

class ChatsService {
  async create(users: string[]) {
    const createdChat = await Chat.create({ messages: [], users });
    return createdChat;
  }
}

const chatsService = new ChatsService();

export default chatsService;
