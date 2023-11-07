"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../../mongo/schemas/user.model");
class UserService {
    async createUser(user) {
        try {
            // Проверяем, существует ли пользователь с такими данными
            const existingUser = await user_model_1.UserModel.findOne({ user_id: user.user_id });
            // Если пользователь существует, возвращаем его данные
            if (existingUser) {
                return existingUser;
            }
            // Если пользователь не существует, создаем нового пользователя
            const newUser = await user_model_1.UserModel.create(user);
            return newUser;
        }
        catch (e) {
            console.error(e);
            throw e; // Пробросим ошибку, чтобы ее обработать в другом месте при необходимости
        }
    }
    async getUserInfo(user_id) {
        return await user_model_1.UserModel.findOne({ user_id });
    }
}
exports.UserService = UserService;
