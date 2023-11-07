"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamsModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
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
exports.ParamsModel = mongoose_1.default.model("Params", paramsSchema);
