import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  user_id: {
    type: Number,
    unique: true,
    required: true,
  },
  first_name: String,
  last_name: String,
  role: {
    type: String,
    default: 'user'
  },
  date_created: { type: Date, default: Date.now },
  price : {
    type: Number
  },
  priceLey: {
    type: String
  },
  addInfo: {
    type: String
  }
});

export const UserModel = mongoose.model("User", userSchema);