import mongoose, { Document } from 'mongoose';
export declare enum Role {
    reader = "user",
    editor = "sawing",
    tester = "door",
    admin = "watcher"
}
export interface UserDocument extends Document {
    username: string;
    user_id: number;
    first_name: string;
    last_name: string;
    role: Role;
    date_created: Date;
}
declare const UserModel: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument> & UserDocument & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default UserModel;
