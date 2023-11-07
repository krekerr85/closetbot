import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  user_id: Number,
  first_name: String,
  last_name: String,
  role: {
    type: String,
    default: 'user'
  },
  date_created: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model("User", userSchema);
