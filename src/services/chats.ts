import { IChatDTO } from "../dtos/chat";
import ApiException from "../exceptions/api";
import Chat, { Message, IChat } from "../models/chat";

class ChatsService {
  async create(users: string[]) {
    const createdChat = await Chat.create({ messages: [], users });
    return createdChat;
  }

  async getOne(
    id: string,
    pagination?: { mesagesPerPage?: number; page?: number }
  ) {
    const chat = await Chat.findById(id);
    if (!chat) {
      throw ApiException.documentNotFound();
    }

    const page = pagination?.page || 1;
    const messagesPerPage = pagination?.mesagesPerPage || 10;

    const startIndex = (page - 1) * messagesPerPage;
    const endIndex = page * messagesPerPage;
    const totalPages = Math.ceil(chat.messages.length / messagesPerPage);

    return { totalPages, messages: chat.messages.splice(startIndex, endIndex) };
  }

  async getAll(uid?: string) {
    const chats = await Chat.find({});
    let userChats = chats;
    if (uid) {
      userChats = chats.filter((chat) => chat.users.includes(uid));
    }
    return userChats;
  }

  async update(chat: IChatDTO) {
    const updatedChat = Chat.findByIdAndUpdate(chat.id, chat, {
      returnDocument: "after",
    });
    return updatedChat;
  }

  async addMessage(chatId: string, message: Message) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw ApiException.documentNotFound();
    }
    chat.messages = [message, ...chat.messages];
    await chat.save();
    return chat;
  }
}

const chatsService = new ChatsService();

export default chatsService;
