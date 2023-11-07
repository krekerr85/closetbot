import { UserModel } from "../../mongo/schemas/user.model";
import { TUser } from "../../types/userType";

export class UserService {
  async createUser(user: TUser) {
    try {
      // Проверяем, существует ли пользователь с такими данными
      const existingUser = await UserModel.findOne({ user_id: user.user_id });

      // Если пользователь существует, возвращаем его данные
      if (existingUser) {
        return existingUser;
      }

      // Если пользователь не существует, создаем нового пользователя
      const newUser = await UserModel.create(user);
      return newUser;
    } catch (e) {
      console.error(e);
      throw e; // Пробросим ошибку, чтобы ее обработать в другом месте при необходимости
    }
  }

  async getUserInfo(user_id: number) {
    return await UserModel.findOne({ user_id });
  }
  async getUserByRole(role: string) {
    return await UserModel.findOne({ role });
  }
  async getUsersByRole(role: string) {
    const users = await UserModel.find({ role });
    const userIds = users.map(user => user.user_id);
    return userIds;
  }
}
