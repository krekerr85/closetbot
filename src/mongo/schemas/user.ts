import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true
  }, // String is shorthand for {type: String}
  id: Number,
  first_name: String,
  last_name: String,
  language_code: String,
  is_bot: Boolean,
  dateCreated: { type: Date, default: Date.now },
  dateMessage: Date,
});

export const UserModel = mongoose.model('User', userSchema);
