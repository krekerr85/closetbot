import mongoose, { Types } from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema({
  user_id: {
    type : Number,
    required : true,
  },
  first_name: {
    type : String,
    required : true,
  },
  message_id: {
    type : Number,
    required : true,
  },

  order_num: Number,
  closet_name: String,
  comment: String,
  accepted: Boolean,
  accepted_date: String,
  ready: Boolean,
  readyDate: String,
  file1Path: String,
  file1Name: String,
  file2Path: String,
  file2Name: String,
  order_watcher_id: {
    type: Types.ObjectId,
    ref: "OrderWatcher",
    required: true, // Указываем на модель, к которой принадлежит данный ObjectId
  },
  date_created: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model("Order", orderSchema);
