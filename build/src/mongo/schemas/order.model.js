"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const orderSchema = new Schema({
    status: {
        type: String,
        require: true,
        default: 'Active'
    },
    order_num: {
        type: Number,
        require: true,
        unique: true,
    },
    order: {
        type: Object,
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
    title: String,
    date_created: { type: Date, default: Date.now },
});
exports.OrderModel = mongoose_1.default.model("Order", orderSchema);
