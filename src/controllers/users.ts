import { Request, Response } from "express";

import usersService from "../services/users";
import UserDTO from "../dtos/user";

class UsersController {
  async getAll(req: Request, res: Response) {
    try {
      const users = (await usersService.getAll()).map(
        (user) => new UserDTO(user)
      );
      res.status(200).json(users);
    } catch (e) {
      res.status(500).json({});
    }
  }
}

const usersController = new UsersController();

export default usersController;
