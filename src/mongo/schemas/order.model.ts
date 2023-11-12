import mongoose from "mongoose";
const { Schema } = mongoose;
const orderSchema = new Schema({
  status: {
    type: String,
    required: true,
    default: "Active",
  },
  order_num: {
    type: Number,
    required: true,
    unique: true,
  },
  order: {
    type: Object,
    required: true,
  },
  last_name: String,
  messages: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  addInfo: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },

  date_created: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model("Order", orderSchema);
