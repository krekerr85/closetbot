import mongoose from "mongoose";
const { Schema } = mongoose;
const priceSchema = new Schema({
  width: {
    type: String,
    require: true,
  },
  door_type:  {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  date_created: { type: Date, default: Date.now },
});

export const PriceModel = mongoose.model(
  "Price",
  priceSchema
);
