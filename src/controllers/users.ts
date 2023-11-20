import { NextFunction, Request, Response } from "express";

import usersService from "../services/users";
import UserDTO from "../dtos/user";

class UsersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = (await usersService.getAll()).map(
        (user) => new UserDTO(user)
      );
      res.status(200).json(users);
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.body);
      res.status(200).json(user);
    } catch (err: any) {
      next(err);
    }
  }
}

const usersController = new UsersController();

export default usersController;
