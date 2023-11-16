import User from "../models/user";

class UsersService {
  async getAll() {
    const users = await User.find({});
    return users;
  }
}

const usersService = new UsersService();

export default usersService;
