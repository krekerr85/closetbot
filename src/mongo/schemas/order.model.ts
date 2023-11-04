import mongoose from "mongoose";
const { Schema } = mongoose;
const orderSchema = new Schema({
  status: {
    type: String,
    require: true,
    default: 'Active'
  },
  order_num: {
    type: Number,
    require: true,
    unique: true,
  },
  order:  {
    type: Object,
    required: true
  },
  user_id: {
    type: Number,
    required: true
  },
  last_name: String,
  message_id: {
    type: Number,
    required: true
  },
  title: String,
  date_created: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model(
  "Order",
  orderSchema
);
