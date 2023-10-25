import mongoose from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema({
  id: Number,
  firstName: String,
  lastName: String,
  orderId: Number,
  orderNum: String,
  closetName: String,
  comment: String,
  accepted: Boolean,
  ready: Boolean,
  file1Path: String,
  file1Name: String,
  file2Path: String,
  file2Name: String,
  dateCreated: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model("Order", orderSchema);
