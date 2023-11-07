"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
    },
    user_id: Number,
    first_name: String,
    last_name: String,
    date_created: { type: Date, default: Date.now },
});
exports.UserModel = mongoose_1.default.model("User", userSchema);
