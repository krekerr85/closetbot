"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubOrderModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const { Schema } = mongoose_1.default;
const subOrderSchema = new Schema({
    user_id: {
        type: Number,
        required: true,
    },
    message_id: {
        type: Number,
        required: true,
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
        type: String,
        required: true,
    },
    order_id: {
        type: mongoose_1.Types.ObjectId,
        ref: "Order",
        required: true, // Указываем на модель, к которой принадлежит данный ObjectId
    },
    date_created: { type: Date, default: Date.now },
    notificationSent: { type: Boolean, default: false },
});
exports.SubOrderModel = mongoose_1.default.model("SubOrder", subOrderSchema);
