import mongoose, { Types } from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema({
  user_id: {
    type : Number,
    required : true,
  },
  message_id: {
    type : Number,
    required : true,
  },
  closet_name: {
    type : String,
    required : true,
  },
  order_num: {
    type : Number,
    required : true,
  },
  file1_path: {
    type : String,
    required : true,
  },
  file1_name: {
    type : String,
    required : true,
  },
  file2_path: {
    type : String,
    required : true,
  },
  file2_name: {
    type : String,
    required : true,
  },
  comment: String,
  accepted_date: {
    type: Date,
    default: null,
  },
  ready_date: {
    type: Date,
    default: null,
  },
  order_type: {
    type : String,
    required : true,
  },
  order_watcher_id: {
    type: Types.ObjectId,
    ref: "OrderWatcher",
    required: true, // Указываем на модель, к которой принадлежит данный ObjectId
  },
  date_created: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model("Order", orderSchema);
