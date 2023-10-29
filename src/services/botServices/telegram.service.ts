import { OrderT, OrderDTO, SubOrderT } from "../../types/orderType";
import { SubOrderService } from "./subOrder.service";
import { UserEnum } from "../../Enums/UserEnum";
import { getFormattedDate } from "../../utils/functions";
import { botT, ctxT } from "../../types/telegramType";
import { OrderService } from "./order.service";
import { OrderModel } from "../../mongo/schemas/order.model";
import { Types } from "mongoose";

export class TelegramService {
  private readonly bot;
  private readonly orderService;
  private readonly subOrderService;
  constructor(bot: botT) {
    this.bot = bot;
    this.subOrderService = new SubOrderService();
    this.orderService = new OrderService();
  }

  async createOrder(order: OrderDTO) {
    const orderDocument = await this.orderService.createOrder(
      this.bot,
      order,
      UserEnum.Watcher
    );

    const { _id } = orderDocument;

    this.subOrderService.createSubOrders(this.bot, order, _id);
  }

  async updateState(ctx: ctxT) {
    const { message_id } = ctx.update.callback_query.message!;

    const subOrder: SubOrderT =
      (await this.subOrderService.getSubOrderByMessageId(
        message_id
      ))!.toObject();

    const orderDocument = await OrderModel.findOne({
      _id: subOrder.order_id,
    });

    if (!orderDocument) {
      return;
    }
    const order: OrderT = orderDocument.toObject();
    const res = await this.updateSubOrderState(ctx, subOrder);
    if (!res) {
      return;
    }
    await this.updateOrderState(subOrder.order_id, order);
  }

  async updateSubOrderState(ctx: ctxT, subOrder: SubOrderT) {
    const { data } = ctx.update.callback_query;
    const { message_id } = ctx.update.callback_query.message!;
    const updatedButtons =
      // @ts-ignore
      ctx.update.callback_query.message!.reply_markup!.inline_keyboard[0];

    if (data === "accepted") {
      if (!subOrder.accepted_date) {
        subOrder.accepted_date = new Date();
        updatedButtons[0].text = `✅ Принял`;
      } else if (subOrder.accepted_date && !subOrder.ready_date) {
        subOrder.accepted_date = null;
        updatedButtons[0].text = `Принял`;
      } else {
        ctx.answerCbQuery();
        return;
      }
    } else if (data === "ready") {
      if (!subOrder.ready_date && subOrder.accepted_date) {
        subOrder.ready_date = new Date();
        updatedButtons[1].text = "✅ Готов";
      } else if (subOrder.ready_date && subOrder.accepted_date) {
        subOrder.ready_date = null;
        updatedButtons[1].text = "Готов";
      } else {
        ctx.answerCbQuery();
        return;
      }
    }

    await this.subOrderService.updateSubOrder(message_id, subOrder);
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [updatedButtons],
    });
    return true;
  }

  async updateOrderState(order_id: Types.ObjectId, order: OrderT) {
    const [subOrderDoor, subOrderSawing] =
      await this.subOrderService.getSubOrdersByOrderId(order_id);
    const message = {
      title: order.title,
      doorAccepted: subOrderDoor.accepted_date
        ? `✅ ${getFormattedDate(subOrderDoor.accepted_date)}`
        : "❎",
      doorReady: subOrderDoor.ready_date
        ? `✅ ${getFormattedDate(subOrderDoor.ready_date)}`
        : "❎",
      sawingAccepted: subOrderSawing.accepted_date
        ? `✅ ${getFormattedDate(subOrderSawing.accepted_date)}`
        : "❎",
      sawingReady: subOrderSawing.ready_date
        ? `✅ ${getFormattedDate(subOrderSawing.ready_date)}`
        : "❎",
    };

    const fullMessage = `${message.title} \nРаспил \n${message.sawingAccepted} \n${message.sawingReady} \nДверь \n${message.doorAccepted} \n${message.doorReady} `;
    await this.bot.telegram.editMessageText(
      order.user_id,
      order.message_id,
      undefined,
      fullMessage
    );
  }
}
