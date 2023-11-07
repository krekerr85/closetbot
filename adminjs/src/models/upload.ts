import { model, Schema, Document } from 'mongoose';

export interface IUpload extends Document {
  fileName: string;
  filePath: string;
}

const UploadSchema: Schema = new Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
});

const UploadModel = model<IUpload>('Upload', UploadSchema);

export default UploadModel;