import mongoose from 'mongoose';
export declare enum Role {
    reader = "user",
    editor = "sawing",
    tester = "door",
    admin = "watcher"
}
export interface UserDocument extends mongoose.Document {
    username: string;
    user_id: number;
    first_name: string;
    last_name: string;
    role: Role;
    date_created: Date;
}
declare const UserModel: mongoose.Model<UserDocument, {}, {}, {}, any>;
export default UserModel;
