import mongoose from "mongoose";
const { Schema } = mongoose;
const orderSchema = new Schema({
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
