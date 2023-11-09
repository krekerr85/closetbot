import mongoose, { Document } from 'mongoose';
export interface PhotoDocument extends Document {
    id: string;
    key: string;
    key1: string;
    key2: string;
    key3: string;
    key4: string;
    key5: string;
}
declare const PhotoModel: mongoose.Model<PhotoDocument, {}, {}, {}, mongoose.Document<unknown, {}, PhotoDocument> & PhotoDocument & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default PhotoModel;
