import { NextFunction, Request, Response } from "express";

import usersService from "../services/users.js";
import UserDTO from "../dtos/user.js";
import FullUserDTO from "../dtos/fullUser.js";
import ApiException from "../exceptions/api.js";

class UsersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const uid = req.user?.id;
      if (!uid) {
        throw new Error("req.user absent");
      }
      const user = await usersService.getOne(uid);
      const users = await usersService.getAll();
      const candidates = users.filter(
        (candidate) =>
          candidate.id !== uid && !user.liked.includes(candidate.id)
      );
      const candidateDtos = candidates.map(
        (candidate) => new UserDTO(candidate)
      );
      res.status(200).json(candidateDtos);
    } catch (e) {
      next(e);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getOne(req.params.id);
      const userDTO = new UserDTO(user);
      res.status(200).json(userDTO);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const uid = req.user?.id;
      if (!uid) {
        throw new Error("req.user undefined");
      }
      const newUser = req.body;
      if (uid !== newUser.id) {
        throw ApiException.forbidden();
      }
      const oldUser = await usersService.getOne(uid);
      const hasNewLike = newUser.liked.length !== oldUser.liked.length;
      if (hasNewLike) {
        const newLike = newUser.liked[newUser.liked.length - 1];
        const likedUser = await usersService.getOne(newLike);
        if (likedUser.liked.includes(uid)) {
          newUser.newMatchs.push(likedUser._id as unknown as string);
          likedUser.newMatchs.push(uid);
          await likedUser.save();
        }
      }

      const updatedUser = await usersService.update(newUser);
      res.status(200).json(new FullUserDTO(updatedUser));
    } catch (err: any) {
      next(err);
    }
  }
}

const usersController = new UsersController();

export default usersController;
