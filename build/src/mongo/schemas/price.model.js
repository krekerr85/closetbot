"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const priceSchema = new Schema({
    width: {
        type: String,
        require: true,
    },
    door_type: {
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
exports.PriceModel = mongoose_1.default.model("Price", priceSchema);
