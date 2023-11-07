"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const order_model_1 = require("../../mongo/schemas/order.model");
const functions_1 = require("../../utils/functions");
class OrderService {
    constructor(googleSheetService) {
        this.googleSheetService = googleSheetService;
    }
    async createOrder(bot, order, user_id) {
        const buttons = [
            { text: "Удалить заказ", callback_data: "deleteOrder" },
        ];
        const keyboard = [[...buttons]];
        const { size, color, door_type, comment } = order;
        const order_num = new Date().getTime();
        const messageTextTitle = `№${order_num} Шкаф ${size} (${color})(${door_type})(${comment})(${(0, functions_1.getFormattedDate)(new Date())})`;
        const messageText = `${messageTextTitle}\nРаспил \n❎ \n❎ \nДвери \n❎ \n❎`;
        const message = await bot.telegram.sendMessage(user_id, (0, functions_1.markdownV2Format)(messageText), {
            reply_markup: {
                inline_keyboard: keyboard,
            },
            parse_mode: "MarkdownV2",
        });
        const orderDoc = await order_model_1.OrderModel.create({
            order_num,
            order,
            user_id,
            message_id: message.message_id,
            title: messageTextTitle,
        });
        await this.googleSheetService.writeData(orderDoc.toObject());
        return orderDoc;
    }
    async updateOrder(message_id, order) {
        return await order_model_1.OrderModel.updateOne({ message_id }, { $set: order });
    }
    async getOrderByMessageId(message_id) {
        return await order_model_1.OrderModel.findOne({ message_id });
    }
}
exports.OrderService = OrderService;
