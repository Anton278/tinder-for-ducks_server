import { NextFunction, Request, Response } from "express";

import usersService from "../services/users";
import UserDTO, { IUserDTO } from "../dtos/user";
import CandidateDTO from "../dtos/candidate";

class UsersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const user: IUserDTO = req.user;
      if (!user) {
        throw new Error("req.user absent");
      }
      const users = await usersService.getAll();
      const candidates = users.filter((candidate) => candidate.id !== user.id);
      const candidateDtos = candidates.map(
        (candidate) => new CandidateDTO(candidate)
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
      const user: IUserDTO = req.body;
      const oldUser = await usersService.getOne(user.id as unknown as string);
      const hasNewLike = user.liked.length !== oldUser.liked.length;
      if (hasNewLike) {
        const newLike = user.liked[user.liked.length - 1];
        const likedUser = await usersService.getOne(newLike);
        if (likedUser.liked.includes(user.id as unknown as string)) {
          user.newMatchs.push(likedUser._id as unknown as string);
          likedUser.newMatchs.push(user.id as unknown as string);
          await likedUser.save();
        }
      }

      const updatedUser = await usersService.update(req.body);
      const userDTO = new UserDTO(updatedUser);
      res.status(200).json(userDTO);
    } catch (err: any) {
      next(err);
    }
  }
}

const usersController = new UsersController();

export default usersController;
