import mongoose from "mongoose";

export const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_DB!);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

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