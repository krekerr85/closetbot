import mongoose from "mongoose";
const { Schema } = mongoose;

const orderWatcherSchema = new Schema({
  id: Number,
  firstName: String,
  lastName: String,
  fullOrder: Array<String>,
  dateCreated: { type: Date, default: Date.now },
});

export const OrderWatcherModel = mongoose.model("OrderWatcher", orderWatcherSchema);
