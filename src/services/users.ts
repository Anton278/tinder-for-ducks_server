import { IFullUserDTO } from "../dtos/fullUser";
import ApiException from "../exceptions/api";
import User from "../models/user";

class UsersService {
  async getAll() {
    const users = await User.find({});
    return users;
  }

  async getOne(id: string) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiException.documentNotFound();
    }
    return user;
  }

  async update(newUser: IFullUserDTO) {
    const user = await User.findOneAndUpdate({ _id: newUser.id }, newUser, {
      new: true,
    });
    if (!user) {
      throw ApiException.documentNotFound();
    }
    return user;
  }
}

const usersService = new UsersService();

export default usersService;
