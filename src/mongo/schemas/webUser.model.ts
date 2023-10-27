import mongoose, { Document, Schema } from 'mongoose';

export interface WebUser extends Document {
    username: string;
    password: string;
}

const webUserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const WebUserModel = mongoose.model<WebUser>('WebUser', webUserSchema);

export default WebUserModel;