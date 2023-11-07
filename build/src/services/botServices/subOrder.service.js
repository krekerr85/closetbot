"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubOrderService = void 0;
const sub_order_model_1 = require("../../mongo/schemas/sub_order.model");
const fs_1 = __importDefault(require("fs"));
const UserEnum_1 = require("../../Enums/UserEnum");
const path_1 = __importDefault(require("path"));
const functions_1 = require("../../utils/functions");
const doorType_1 = require("../../types/doorType");
const filesDirectory = path_1.default.join(__dirname, "../../../static_files");
class SubOrderService {
    async createSubOrders(bot, order, order_id, order_num) {
        const { size, comment, color, door_type } = order;
        const [file1_path, file1_name, file2_path, file2_name] = await this.getOrderFiles(size, color, door_type);
        const file1Data = fs_1.default.createReadStream(file1_path);
        const file2Data = fs_1.default.createReadStream(file2_path);
        const buttons = [
            { text: "Принял", callback_data: "accepted" },
            { text: "Готов", callback_data: "ready" },
        ];
        const keyboard = [[...buttons]];
        await bot.telegram.sendMediaGroup(UserEnum_1.UserEnum.Sawing, [
            {
                media: { source: file1Data, filename: file1_name },
                type: "document",
            },
            {
                media: { source: file2Data, filename: file2_name },
                type: "document",
            },
        ]);
        const messageTitle = `№${order_num} Шкаф ${size} (${color})(${door_type})(${comment})(${(0, functions_1.getFormattedDate)(new Date())})`;
        const sawingMessage = await bot.telegram.sendMessage(UserEnum_1.UserEnum.Sawing, (0, functions_1.markdownV2Format)(messageTitle), {
            reply_markup: {
                inline_keyboard: keyboard,
            },
            parse_mode: "MarkdownV2",
        });
        const newSubSawingOrder = {
            user_id: sawingMessage.chat.id,
            message_id: sawingMessage.message_id,
            order_id,
            order_type: "door",
        };
        await sub_order_model_1.SubOrderModel.create(newSubSawingOrder);
        const doorMessage = await bot.telegram.sendMessage(UserEnum_1.UserEnum.Door, (0, functions_1.markdownV2Format)(messageTitle), {
            reply_markup: {
                inline_keyboard: keyboard,
            },
            parse_mode: "MarkdownV2",
        });
        const newSubDoorOrder = {
            user_id: doorMessage.chat.id,
            message_id: doorMessage.message_id,
            order_id,
            order_type: "door",
        };
        await sub_order_model_1.SubOrderModel.create(newSubDoorOrder);
    }
    getOrderFiles(size, color, door_type) {
        const filePath = path_1.default.join(filesDirectory, `files/${size}/${doorType_1.doorTypes[door_type]}/${color}`);
        const fileArr = [];
        return new Promise((res, rej) => {
            fs_1.default.readdir(filePath, (err, files) => {
                if (err) {
                    console.error("Ошибка чтения директории:", err);
                    rej();
                }
                for (const file of files) {
                    fileArr.push(path_1.default.join(filePath, file), file);
                }
                res(fileArr);
            });
        });
    }
    async updateSubOrder(message_id, subOrder) {
        return await sub_order_model_1.SubOrderModel.updateOne({ message_id }, { $set: subOrder });
    }
    async getSubOrderByMessageId(message_id) {
        return await sub_order_model_1.SubOrderModel.findOne({ message_id });
    }
    async getSubOrdersByOrderId(order_id) {
        return await sub_order_model_1.SubOrderModel.find({ order_id }).sort({ order_type: 1 });
    }
}
exports.SubOrderService = SubOrderService;
