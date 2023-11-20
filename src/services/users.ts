import { IUserDTO } from "../dtos/user";
import ApiException from "../exceptions/api";
import User from "../models/user";

class UsersService {
  async getAll() {
    const users = await User.find({});
    return users;
  }

  async update(newUser: IUserDTO) {
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
