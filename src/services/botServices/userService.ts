import { UserModel } from "../../mongo/schemas/user";
import { TUser } from "../../types/userType";

export class UserService {
  async createUser(user: TUser) {
    try {
      return await UserModel.create(user);
    } catch (e) {
      console.log(e);
    }
  }

  async getUserInfo(userId: Number) {
    const res = await UserModel.findOne({ userId });
    return res;
  }
}
