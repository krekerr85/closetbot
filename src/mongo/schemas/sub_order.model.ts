import mongoose, { Types } from "mongoose";

const { Schema } = mongoose;

const subOrderSchema = new Schema({
  user_id: {
    type : Number,
    required : true,
  },
  message_id: {
    type : Number,
    required : true,
  },
  messageIds: {
    type : Array,
  },
  accepted_date: {
    type: Date,
    default: null,
  },
  ready_date: {
    type: Date,
    default: null,
  },
  order_type: {
    type : String,
    required : true,
  },
  order_id: {
    type: Types.ObjectId,
    ref: "Order",
    required: true, // Указываем на модель, к которой принадлежит данный ObjectId
  },
  date_created: { type: Date, default: Date.now },
  notificationSent: { type: Boolean, default: false},
});

export const SubOrderModel = mongoose.model("SubOrder", subOrderSchema);
