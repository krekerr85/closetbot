import mongoose from "mongoose";
const { Schema } = mongoose;

const orderWatcherSchema = new Schema({
  user_id: {
    type: Number,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: String,
  message_id: {
    type: Number,
    required: true
  },
  date_created: { type: Date, default: Date.now },
});

export const OrderWatcherModel = mongoose.model(
  "OrderWatcher",
  orderWatcherSchema
);
