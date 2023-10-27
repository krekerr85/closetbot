import { UserModel } from "../../mongo/schemas/user.model";
import { TUser } from "../../types/userType";

export class UserService {
  async createUser(user: TUser) {
    try {
      return await UserModel.create(user);
    } catch (e) {
      console.log(e);
    }
  }

  async getUserInfo(user_id: Number) {
    return  await UserModel.findOne({ user_id });
  }
}
