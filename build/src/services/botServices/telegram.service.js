"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const subOrder_service_1 = require("./subOrder.service");
const UserEnum_1 = require("../../Enums/UserEnum");
const functions_1 = require("../../utils/functions");
const order_service_1 = require("./order.service");
const order_model_1 = require("../../mongo/schemas/order.model");
const sub_order_model_1 = require("../../mongo/schemas/sub_order.model");
const params_model_1 = require("../../mongo/schemas/params.model");
const google_sheet_service_1 = require("./google_sheet.service");
const telegraf_1 = require("telegraf");
const user_service_1 = require("./user.service");
class TelegramService {
    constructor(bot) {
        this.bot = bot;
        this.googleSheetService = new google_sheet_service_1.GoogleSheetService();
        this.userService = new user_service_1.UserService();
        this.subOrderService = new subOrder_service_1.SubOrderService();
        this.orderService = new order_service_1.OrderService(this.googleSheetService);
        this.init();
        setInterval(() => {
            this.checkExpiredOrders();
        }, 60 * 5000);
    }
    async init() {
        this.bot.start((ctx) => {
            const userSender = {
                user_id: ctx.update.message.from.id,
                first_name: ctx.update.message.from.first_name,
            };
            this.userService.createUser(userSender);
            if (ctx.update.message.from.id === UserEnum_1.UserEnum.Watcher) {
                return ctx.reply(`Привет, ${ctx.update.message.from.first_name}!`, telegraf_1.Markup.keyboard([
                    telegraf_1.Markup.button.webApp("Конструктор", "https://zrealm.ru"),
                ]).resize());
            }
        });
        this.bot.on("callback_query", async (ctx) => {
            await this.updateState(ctx);
        });
    }
    async createOrder(order) {
        const orderDocument = await this.orderService.createOrder(this.bot, order, UserEnum_1.UserEnum.Watcher);
        const { _id, order_num } = orderDocument;
        await this.subOrderService.createSubOrders(this.bot, order, _id, order_num);
    }
    async updateState(ctx) {
        var _a;
        const { message_id } = ctx.update.callback_query.message;
        const subOrder = (_a = (await this.subOrderService.getSubOrderByMessageId(message_id))) === null || _a === void 0 ? void 0 : _a.toObject();
        if (!subOrder) {
            const order = await this.orderService.getOrderByMessageId(message_id);
            if (!order) {
                return;
            }
            const subOrders = await this.subOrderService.getSubOrdersByOrderId(order._id);
            for (const subOrder of subOrders) {
                await this.updateSubOrderState(ctx, order.toObject(), subOrder.toObject(), subOrder.message_id);
            }
            await this.updateOrderState(order._id, order.toObject(), true);
        }
        else {
            const orderDocument = await order_model_1.OrderModel.findOne({
                _id: subOrder.order_id,
            });
            if (!orderDocument) {
                return;
            }
            const order = orderDocument.toObject();
            const res = await this.updateSubOrderState(ctx, order, subOrder, message_id);
            if (!res) {
                return;
            }
            await this.updateOrderState(subOrder.order_id, order);
        }
    }
    async updateSubOrderState(ctx, order, subOrder, message_id) {
        // @ts-ignore
        const { data } = ctx.update.callback_query;
        let updatedButtons = 
        // @ts-ignore
        ctx.update.callback_query.message.reply_markup.inline_keyboard[0];
        console.log(data);
        console.log(message_id);
        if (data === "accepted") {
            if (!subOrder.accepted_date) {
                subOrder.accepted_date = new Date();
                updatedButtons[0].text = `✅ Принял`;
            }
            else if (subOrder.accepted_date && !subOrder.ready_date) {
                subOrder.accepted_date = null;
                updatedButtons[0].text = `Принял`;
            }
            else {
                ctx.answerCbQuery();
                return;
            }
        }
        else if (data === "ready") {
            if (!subOrder.ready_date && subOrder.accepted_date) {
                subOrder.ready_date = new Date();
                updatedButtons[1].text = "✅ Готов";
            }
            else if (subOrder.ready_date && subOrder.accepted_date) {
                subOrder.ready_date = null;
                updatedButtons[1].text = "Готов";
            }
            else {
                ctx.answerCbQuery();
                return;
            }
        }
        else if (data === "deleteOrder") {
            updatedButtons = [];
            this.bot.telegram.sendMessage(subOrder.user_id, "Данный заказ был удален оператором", {
                reply_to_message_id: subOrder.message_id,
            });
            order.status = "Cancelled";
            order.title = `~${order.title}~`;
        }
        await this.subOrderService.updateSubOrder(message_id, subOrder);
        await this.bot.telegram.editMessageText(subOrder.user_id, message_id, undefined, (0, functions_1.markdownV2Format)(order.title), {
            reply_markup: {
                inline_keyboard: [updatedButtons],
            },
            parse_mode: "MarkdownV2",
        });
        return true;
    }
    async updateOrderState(order_id, order, deleted = false) {
        const buttons = [
            { text: "Удалить заказ", callback_data: "deleteOrder" },
        ];
        const keyboard = [[...buttons]];
        const [subOrderDoor, subOrderSawing] = await this.subOrderService.getSubOrdersByOrderId(order_id);
        const message = {
            title: order.title,
            doorAccepted: subOrderDoor.accepted_date
                ? `✅ ${(0, functions_1.getFormattedDate)(subOrderDoor.accepted_date)}`
                : "❎",
            doorReady: subOrderDoor.ready_date
                ? `✅ ${(0, functions_1.getFormattedDate)(subOrderDoor.ready_date)}`
                : "❎",
            sawingAccepted: subOrderSawing.accepted_date
                ? `✅ ${(0, functions_1.getFormattedDate)(subOrderSawing.accepted_date)}`
                : "❎",
            sawingReady: subOrderSawing.ready_date
                ? `✅ ${(0, functions_1.getFormattedDate)(subOrderSawing.ready_date)}`
                : "❎",
        };
        let fullMessage = "";
        if (deleted) {
            fullMessage = `~${message.title}~ \nРаспил \n${message.sawingAccepted} \n${message.sawingReady} \nДверь \n${message.doorAccepted} \n${message.doorReady}`;
            await this.bot.telegram.editMessageText(order.user_id, order.message_id, undefined, (0, functions_1.markdownV2Format)(fullMessage), {
                reply_markup: {
                    inline_keyboard: [],
                },
                parse_mode: "MarkdownV2",
            });
        }
        else {
            fullMessage = `${message.title} \nРаспил \n${message.sawingAccepted} \n${message.sawingReady} \nДверь \n${message.doorAccepted} \n${message.doorReady}`;
            await this.bot.telegram.editMessageText(order.user_id, order.message_id, undefined, (0, functions_1.markdownV2Format)(fullMessage), {
                reply_markup: {
                    inline_keyboard: keyboard,
                },
                parse_mode: "MarkdownV2",
            });
        }
    }
    async checkExpiredOrders() {
        try {
            const params = await params_model_1.ParamsModel.findOne(); // Получаем объект параметров из базы данных
            const daysForProduction = (params === null || params === void 0 ? void 0 : params.daysForProduction) || 4;
            const hoursForProcessing = (params === null || params === void 0 ? void 0 : params.hoursForProcessing) || 3;
            // Получите заказы из базы данных, у которых accepted_date имеет значение null и созданы более 4 часов назад
            const expiredNotAcceptedOrders = await sub_order_model_1.SubOrderModel.find({
                accepted_date: null,
                date_created: {
                    $lt: new Date(Date.now() - hoursForProcessing * 60 * 60 * 1000),
                },
                notificationSent: false, // Поле notificationSent равно false
            });
            const expiredNotReadyOrders = await sub_order_model_1.SubOrderModel.find({
                accepted_date: { $ne: null },
                ready_date: null,
                date_created: {
                    $lt: new Date(Date.now() - daysForProduction * 24 * 60 * 60 * 1000),
                },
                notificationSent: false, // Поле notificationSent равно false
            });
            for (const subOrder of expiredNotAcceptedOrders) {
                await this.bot.telegram.sendMessage(subOrder.user_id, "Просрочена дата принятия заказа!", {
                    reply_to_message_id: subOrder.message_id,
                });
                await sub_order_model_1.SubOrderModel.findByIdAndUpdate(subOrder._id, {
                    notificationSent: true,
                });
            }
            for (const subOrder of expiredNotReadyOrders) {
                await this.bot.telegram.sendMessage(subOrder.user_id, "Просрочена дата изготовления заказа!", {
                    reply_to_message_id: subOrder.message_id,
                });
                await sub_order_model_1.SubOrderModel.findByIdAndUpdate(subOrder._id, {
                    notificationSent: true,
                });
            }
        }
        catch (error) {
            console.error("Ошибка при проверке заказов:", error);
        }
    }
}
exports.TelegramService = TelegramService;
