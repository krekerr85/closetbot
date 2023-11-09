import mongoose from 'mongoose';

export enum Role {
  reader = 'user',
  editor = 'sawing',
  tester = 'door',
  admin = 'watcher',
}

export interface UserDocument extends mongoose.Document {
  username: string;
  user_id: number,
  first_name: string,
  last_name: string,
  role: Role;
  date_created: Date
}

const userSchema: mongoose.Schema = new mongoose.Schema({
  username: {type: String},
  user_id: {type: Number},
  first_name: {type: String},
  last_name: {type: String},
  role: {type: String, enum: Role},
  date_created: {type: Date},
});

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;