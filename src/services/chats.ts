import ChatDTO, { IChatDTO } from "../dtos/chat";
import ApiException from "../exceptions/api";
import Chat, { Message } from "../models/chat";
import { v4 as uuidv4 } from "uuid";

class ChatsService {
  async create(users: string[]) {
    const createdChat = await Chat.create({ messages: [], users });
    return createdChat;
  }

  async getOne(id: string, page: number = 1, messagesPerPage: number = 10) {
    const chat = await Chat.findById(id);
    if (!chat) {
      throw ApiException.documentNotFound();
    }
    const chatDTO = new ChatDTO(chat);

    const startIndex = (page - 1) * messagesPerPage;
    const endIndex = page * messagesPerPage;
    const totalPages = Math.ceil(chat.messages.length / messagesPerPage);

    chatDTO.messages = chatDTO.messages.slice(startIndex, endIndex);

    return { chat: chatDTO, totalPages, page };
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

  async addMessage(chatId: string, message: string, authorId: string) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw ApiException.documentNotFound();
    }
    const newMessage = { message, authorId, id: uuidv4() };
    chat.messages = [newMessage, ...chat.messages];
    await chat.save();
    return newMessage;
  }
}

const chatsService = new ChatsService();

export default chatsService;
