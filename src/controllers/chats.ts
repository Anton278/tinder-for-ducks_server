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
      const chats = await chatsService.getAll();
      const chatDTOs = chats.map((chat) => new ChatDTO(chat));
      res.status(200).json(chatDTOs);
    } catch (err) {
      next(err);
    }
  }

  async addMessage(chatId: string, message: Message) {
    try {
      const oldChat = await chatsService.getOne(chatId);
      const oldChatDTO = new ChatDTO(oldChat);
      const updatedChat = await chatsService.update({
        ...oldChatDTO,
        messages: [message, ...oldChatDTO.messages],
      });
    } catch (err) {
      console.log(err);
    }
  }
}

const chatsController = new ChatsController();

export default chatsController;
