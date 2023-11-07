import mongoose, { Schema, Document } from 'mongoose';

export interface PhotoDocument extends Document {
  id: string;
  key: string;
  key1: string;
  key2: string;
  key3: string;
  key4: string;
  key5: string;
}

const PhotoSchema: Schema = new Schema({
  id: { type: String},
  key: { type: String},
  key1: { type: String },
  key2: { type: String },
  key3: { type: String },
  key4: { type: String },
  key5: { type: String },
});

const PhotoModel = mongoose.model<PhotoDocument>('Photo', PhotoSchema);

export default PhotoModel;