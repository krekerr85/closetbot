"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGO_DB);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//1) npm run local-services 2) подключиться через compass mongodb://closetbot:closetbot@localhost:17017/ 
// 3) создать пользователя 
// db.createUser({
//   user: 'closetbot',
//   pwd: 'closetbot',
//   roles: [
//     {
//       role: 'readWrite',
//       db: 'closetbot',
//     },
//   ],
// });
// 
