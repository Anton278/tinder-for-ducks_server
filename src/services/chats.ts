import { IChatDTO } from "../dtos/chat";
import ApiException from "../exceptions/api";
import Chat, { Message, IChat } from "../models/chat";

class ChatsService {
  async create(users: string[]) {
    const createdChat = await Chat.create({ messages: [], users });
    return createdChat;
  }

  async getOne(id: string) {
    const chat = await Chat.findById(id);
    if (!chat) {
      throw ApiException.documentNotFound();
    }
    return chat;
  }

  async getAll() {
    const chats = await Chat.find({});
    return chats;
  }

  async update(chat: IChatDTO) {
    const updatedChat = Chat.findByIdAndUpdate(chat.id, chat, {
      returnDocument: "after",
    });
    return updatedChat;
  }

  async addMessage(chatId: string, message: Message) {
    // await Chat.
  }
}

const chatsService = new ChatsService();

export default chatsService;
