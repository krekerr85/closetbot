import mongoose from "mongoose";
const { Schema } = mongoose;
const paramsSchema = new Schema({
  hoursForProcessing: {
    type: Number,
    require: true,
  },
  daysForProduction: {
    type: Number,
    required: true,
  },
  date_created: { type: Date, default: Date.now },
});

export const ParamsModel = mongoose.model("Params", paramsSchema);
