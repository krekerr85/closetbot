import mongoose from "mongoose";
const { Schema } = mongoose;

const orderWatcherSchema = new Schema({
  userId: Number,
  firstName: String,
  lastName: String,
  messageId: Number,
  dateCreated: { type: Date, default: Date.now },
});

export const OrderWatcherModel = mongoose.model(
  "OrderWatcher",
  orderWatcherSchema
);
