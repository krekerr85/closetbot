import mongoose from "mongoose";
const { Schema } = mongoose;
const orderWatcherSchema = new Schema({
  closet_name:  {
    type: String,
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
  sawingMessage: {
    type : Object,
  },
  doorMessage: Object,
  date_created: { type: Date, default: Date.now },
});

export const OrderWatcherModel = mongoose.model(
  "OrderWatcher",
  orderWatcherSchema
);
