import mongoose from "mongoose";

export interface OrderDocument extends mongoose.Document {
  status: string;
  order_num: number;
  date_created: Date;
}

const orderSchema: mongoose.Schema = new mongoose.Schema({
  status: {
    type: String,
    require: true,
    default: "Active",
  },
  order_num: {
    type: Number,
    require: true,
    unique: true,
  },
  title: String,
  date_created: { type: Date, default: Date.now },
});

const OrderModel = mongoose.model<OrderDocument>("Order", orderSchema);

export default OrderModel;
