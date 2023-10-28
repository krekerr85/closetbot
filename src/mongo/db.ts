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

