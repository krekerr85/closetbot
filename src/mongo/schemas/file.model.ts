interface IFile {
    id: number;
    s3Key: string;
    bucket: string;
    mime: string;
    comment: string | null;
  }
  import mongoose from "mongoose";
  const { Schema } = mongoose;
  const orderSchema = new Schema({
    key: String,
    bucket: String,
    mime: String,
    comment: String,
    path: String,
    date_created: { type: Date, default: Date.now },
  });
  
  export const OrderModel = mongoose.model(
    "Order",
    orderSchema
  );
  