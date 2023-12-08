import type { NextFunction, Request, Response } from "express";

import chatsService from "../services/chats";
import ChatDTO from "../dtos/chat";
import usersService from "../services/users";
import FullUserDTO from "../dtos/fullUser";

class ChatsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const users = req.body.users;
      if (!Array.isArray(users)) {
        return res.status(400).json({ message: "users property is not array" });
      }
      if (users.length !== 2) {
        res.status(400).json({ message: "users length is not equal 2" });
      }
      const createdChat = await chatsService.create(users);
      const createdChatDTO = new ChatDTO(createdChat);

      const firstUser = await usersService.getOne(users[0]);
      const firstUserDTO = new FullUserDTO(firstUser);
      await usersService.update({
        ...firstUserDTO,
        chats: [...firstUserDTO.chats, createdChat.id],
      });

      const secondUser = await usersService.getOne(users[1]);
      const secondUserDTO = new FullUserDTO(secondUser);
      await usersService.update({
        ...secondUserDTO,
        chats: [...secondUserDTO.chats, createdChat.id],
      });
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
      const chats = await chatsService.getAll(user.id);
      const chatDTOs = chats.map((chat) => new ChatDTO(chat));
      res.status(200).json(chatDTOs);
    } catch (err) {
      next(err);
    }
  }
}

const chatsController = new ChatsController();

export default chatsController;
