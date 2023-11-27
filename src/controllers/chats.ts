import type { NextFunction, Request, Response } from "express";

import chatsService from "../services/chats";
import ChatDTO from "../dtos/chat";

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
}

const chatsController = new ChatsController();

export default chatsController;
