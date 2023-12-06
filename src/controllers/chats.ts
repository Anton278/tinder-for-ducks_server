import type { NextFunction, Request, Response } from "express";

import chatsService from "../services/chats";
import ChatDTO from "../dtos/chat";
import { Message } from "../models/chat";

class ChatsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!Array.isArray(req.body.users)) {
        return res.status(400).json({ message: "users property is not array" });
      }
      if (req.body.users.length !== 2) {
        res.status(400).json({ message: "users length is not equal 2" });
      }
      const createdChat = await chatsService.create(req.body.users);
      const createdChatDTO = new ChatDTO(createdChat);
      res.status(200).json(createdChatDTO);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const user = req.user;
      if (!user) {
        throw new Error("req.user is undefined");
      }
      const chats = await chatsService.getAll();
      const userChats = chats.filter(
        (chat) => chat.users[0] === user.id || chat.users[1] === user.id
      );
      const chatDTOs = userChats.map((chat) => new ChatDTO(chat));
      res.status(200).json(chatDTOs);
    } catch (err) {
      next(err);
    }
  }

  async getOne(
    id: string,
    uid: string,
    {
      mesagesPerPage = 10,
      page = 1,
    }: {
      mesagesPerPage: number | undefined;
      page: number | undefined;
    }
  ) {
    const chat = await chatsService.getOne(id);
    const isNotParticipant = !chat.users.includes(uid);
    if (isNotParticipant) {
      throw new Error("");
    }
    const startIndex = (page - 1) * mesagesPerPage;
    const endIndex = page * mesagesPerPage;
    const totalPages = Math.ceil(chat.messages.length / mesagesPerPage);
    chat.messages.splice(startIndex, endIndex);
    return { totalPages, messages: chat.messages };
  }

  async addMessage(chatId: string, message: Message) {
    const oldChat = await chatsService.getOne(chatId);
    const oldChatDTO = new ChatDTO(oldChat);
    const updatedChat = await chatsService.update({
      ...oldChatDTO,
      messages: [message, ...oldChatDTO.messages],
    });
  }
}

const chatsController = new ChatsController();

export default chatsController;
