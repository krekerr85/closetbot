import { model, Schema } from 'mongoose';
const UploadSchema = new Schema({
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
});
const UploadModel = model('Upload', UploadSchema);
export default UploadModel;
