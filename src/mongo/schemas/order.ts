import mongoose, { Types } from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema({
  userId: Number,
  firstName: String,
  lastName: String,
  messageId: Number,
  orderNum: String,
  closetName: String,
  comment: String,
  accepted: Boolean,
  acceptedDate: String,
  ready: Boolean,
  readyDate: String,
  file1Path: String,
  file1Name: String,
  file2Path: String,
  file2Name: String,
  orderWatcherId: {
    type: Types.ObjectId,
    ref: "OrderWatcher",
    required: true, // Указываем на модель, к которой принадлежит данный ObjectId
  },
  dateCreated: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model("Order", orderSchema);
