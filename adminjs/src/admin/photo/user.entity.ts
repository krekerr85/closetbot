import mongoose, { Schema, Document } from 'mongoose';

export enum Role {
  reader = 'user',
  editor = 'sawing',
  tester = 'door',
  admin = 'watcher',
}

export interface UserDocument extends Document {
  username: string;
  user_id: number,
  first_name: string,
  last_name: string,
  role: Role;
  date_created: Date
}

const userSchema: Schema = new Schema({
  username: {type: String},
  user_id: {type: Number},
  first_name: {type: String},
  last_name: {type: String},
  role: {type: String, enum: Role},
  date_created: {type: Date},
});

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;