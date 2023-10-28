import { OrderT, OrderDTO } from "../../types/orderType";
import { OrderService } from "./order.service";
import { OrderWatcherModel } from "../../mongo/schemas/order_watcher.model";
import { UserEnum } from "../../Enums/UserEnum";
import { OrderWatcherT } from "../../types/orderWatcherType";
import { getFormattedDate } from "../../utils/functions";
import { botT, ctxT } from "../../types/telegramType";
import { OrderWatcherService } from "./orderWatcher.service";
import { OrderEnum } from "../../Enums/OrderEnum";

export class TelegramService {
  private readonly bot;
  private readonly orderService;
  private readonly orderWatcherService;
  constructor(bot: botT) {
    this.bot = bot;
    this.orderService = new OrderService();
    this.orderWatcherService = new OrderWatcherService();
  }

  async createOrder(order: OrderDTO) {
    const orderWatcherDocument =
      await this.orderWatcherService.createOrderWatcher(
        this.bot,
        order.closet_name,
        UserEnum.Sawing
      );

    const { _id } = orderWatcherDocument;
    this.orderService.createOrder(
      this.bot,
      UserEnum.Sawing,
      order,
      _id,
      OrderEnum.Sawing
    );

    this.orderService.createOrder(
      this.bot, 
      UserEnum.Door, 
      order, 
      _id, 
      OrderEnum.Door,
    );
  }

  async updateState(ctx: ctxT) {
    const { data } = ctx.update.callback_query;
    const { message_id } = ctx.update.callback_query.message!;

    const order: OrderT = (await this.orderService.getOrderByOrderId(
      message_id
    ))!.toObject();

    const orderWatcherDocument = await OrderWatcherModel.findOne({
      _id: order.order_watcher_id,
    });

    if (!orderWatcherDocument) {
      return;
    }
    const orderWatcher: OrderWatcherT = orderWatcherDocument.toObject();
    const res = await this.updateOrderState(ctx, order);
    if (!res) {
      return;
    }
    await this.updateWatcherState(orderWatcher, order, data);
  }

  async updateOrderState(ctx: ctxT, order: OrderT) {
    const { data } = ctx.update.callback_query;
    const { message_id } = ctx.update.callback_query.message!;
    const updatedButtons =
      // @ts-ignore
      ctx.update.callback_query.message!.reply_markup!.inline_keyboard[0];

    if (data === "accepted") {
      if (!order.accepted_date) {
        order.accepted_date = new Date();
        updatedButtons[0].text = `✅ Принял`;
      } else if (order.accepted_date && !order.ready_date) {
        order.accepted_date = null;
        updatedButtons[0].text = `Принял`;
      } else {
        ctx.answerCbQuery();
        return;
      }
    } else if (data === "ready") {
      if (!order.ready_date && order.accepted_date) {
        order.ready_date = new Date();
        updatedButtons[1].text = "✅ Готов";
      } else if (order.ready_date && order.accepted_date) {
        order.ready_date = null;
        updatedButtons[1].text = "Готов";
      } else {
        ctx.answerCbQuery();
        return;
      }
    }

    await this.orderService.updateOrder(message_id, order);
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [updatedButtons],
    });
    return true;
  }

  async updateWatcherState(
    orderWatcher: OrderWatcherT,
    order: OrderT,
    data: string
  ) {
    let { sawingMessage, doorMessage } = orderWatcher;
    if (order.order_type === "sawing") {
      if (data === "accepted") {
        sawingMessage = {
          title: orderWatcher.closet_name,
          userType: "Распил",
          accepted: order.accepted_date
            ? `✅ ${getFormattedDate(order.accepted_date)}`
            : `❎`,
          ready: order.accepted_date ? sawingMessage.ready : `❎`,
        };
      } else if (data === "ready") {
        sawingMessage = {
          title: orderWatcher.closet_name,
          userType: "Распил",
          accepted: sawingMessage.accepted,
          ready: order.ready_date
            ? `✅ ${getFormattedDate(order.ready_date)}`
            : `❎`,
        };
      }
    } else if (order.order_type === "door") {
      if (data === "accepted") {
        doorMessage = {
          title: orderWatcher.closet_name,
          userType: "Двери",
          accepted: order.accepted_date
            ? `✅ ${getFormattedDate(order.accepted_date)}`
            : `❎`,
          ready: order.accepted_date ? doorMessage.ready : `❎`,
        };
      } else if (data === "ready") {
        doorMessage = {
          title: orderWatcher.closet_name,
          userType: "Двери",
          accepted: doorMessage.accepted,
          ready: order.ready_date
            ? `✅ ${getFormattedDate(order.ready_date)}`
            : `❎`,
        };
      }
    }

    const fullMessage = `${orderWatcher.closet_name} \n${sawingMessage.userType} \n${sawingMessage.accepted} \n${sawingMessage.ready} \n${doorMessage.userType} \n${doorMessage.accepted} \n${doorMessage.ready}`;
    await this.bot.telegram.editMessageText(
      orderWatcher.user_id,
      orderWatcher.message_id,
      undefined,
      fullMessage
    );
    const update = {
      $set: {
        sawingMessage: sawingMessage,
        doorMessage: doorMessage,
      },
    };
    await OrderWatcherModel.updateOne({ _id: order.order_watcher_id }, update);
  }
}
