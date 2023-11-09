import mongoose, { Schema } from 'mongoose';
const PhotoSchema = new Schema({
    id: { type: String },
    key: { type: String },
    key1: { type: String },
    key2: { type: String },
    key3: { type: String },
    key4: { type: String },
    key5: { type: String },
});
const PhotoModel = mongoose.model('Photo', PhotoSchema);
export default PhotoModel;
