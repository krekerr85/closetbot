import { Context, NarrowedContext, Telegraf } from "telegraf";
import { UserOrder } from "../../classes/UserOrder";
import { TOrder, TOrderDTO } from "../../types/orderType";
import { UserService } from "./user.service";
import {
  CallbackQuery,
  InlineKeyboardButton,
  Update,
} from "telegraf/typings/core/types/typegram";
import { OrderService } from "./order.service";
import { OrderWatcherModel } from "../../mongo/schemas/order_watcher";
import { UserEnum } from "../../Enums/UserEnum";
import { Types } from "mongoose";
import { orderWatcherT } from "../../types/orderWatcherType";

export type newSawingMessageT = {
    title: string;
    userType: string;
    accepted: string;
    ready: string;
}
export type ctxT = NarrowedContext<
Context<Update>,
Update.CallbackQueryUpdate<CallbackQuery>
>;

export class OrderWatcherService {
  private readonly userService;
  private readonly bot;
  private readonly orderService;
  public readonly usersOrders: UserOrder[] = [];
  constructor(bot: Telegraf<Context<Update>>) {
    this.userService = new UserService();
    this.bot = bot;
    this.orderService = new OrderService();
  }

  getFormattedDate() {
    const currentDate = new Date();

    const year = currentDate.getFullYear().toString().slice(-2); // Получаем последние две цифры года
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Получаем месяц (с нулем впереди, если месяц < 10)
    const day = ("0" + currentDate.getDate()).slice(-2); // Получаем день (с нулем впереди, если день < 10)
    return `${day}.${month}.${year}`;
  }

  async sendMessageToWatcher(closetName: string) {
    const userWatcher = await this.userService.getUserInfo(UserEnum.Watcher);
    const { first_name, user_id, date_created } = userWatcher!.toObject();
    if (!user_id) {
      return;
    }
    const messageText = `${closetName} \n Распил \n ❎ \n ❎`;
    const message = await this.bot.telegram.sendMessage(user_id, messageText);

    const orderWatcher = await OrderWatcherModel.create({
      first_name,
      user_id,
      date_created,
      message_id: message.message_id,
    });

    return orderWatcher._id;
  }

  async updateWatcherMessage(newSawingMessage: newSawingMessageT, orderWatcher: orderWatcherT){
    const fullMessage = `${newSawingMessage.title} \n ${newSawingMessage.userType} \n ${newSawingMessage.accepted} \n ${newSawingMessage.ready}`;
    await this.bot.telegram.editMessageText(
      orderWatcher.user_id,
      orderWatcher.message_id,
      undefined,
      fullMessage
    );
  }

  async createOrder(order: TOrderDTO) {
    const orderWatcherId = await this.sendMessageToWatcher(order.closet_name);
    if (!orderWatcherId) {
      return;
    }

    const userSawing = await this.userService.getUserInfo(UserEnum.Sawing);

    this.usersOrders.push(
      new UserOrder(order, userSawing!.toObject(), this.bot, orderWatcherId)
    );
  }

  async updateState(
    ctx: ctxT
  ) {
    const { message_id } = ctx.update.callback_query.message!;
    const { data } = ctx.update.callback_query;
    const order: TOrder & { _id: Types.ObjectId } =
      (await this.orderService.getOrderByOrderId(message_id))!.toObject();
    if (!order) {
      return;
    }

    const { order_watcher_id } = order;
    const orderWatcher = await OrderWatcherModel.findOne({
      _id: order_watcher_id,
    });
    console.log(orderWatcher)
    if (!orderWatcher) {
      return;
    }

    const newSawingMessage = {
      title: order.closet_name,
      userType: "Распил",
      accepted: "❎",
      ready: "❎",
    };

    const updatedButtons: InlineKeyboardButton[] =
      // @ts-ignore
      ctx.update.callback_query.message.reply_markup!.inline_keyboard[0];

    this.setState(data, order, updatedButtons, newSawingMessage, ctx, message_id);

    await ctx.editMessageReplyMarkup({
      inline_keyboard: [updatedButtons],
    });

    this.updateWatcherMessage(newSawingMessage, orderWatcher);
  }

  async setState(
    data: string,
    order: TOrder,
    updatedButtons: InlineKeyboardButton[],
    newSawingMessage: newSawingMessageT,
    ctx: ctxT,
    message_id: number,
  ) {
    let accepted_date;
    let ready_date;
    const formattedDate = this.getFormattedDate();
    if (data === "accepted") {
      if (!order.accepted) {
        order.accepted = true;
        accepted_date = formattedDate;
        updatedButtons[0].text = "✅ Принял";
        newSawingMessage.accepted = `✅ ${accepted_date}`;
        await ctx.answerCbQuery("Вы приняли заказ!");
      } else if (order.accepted && !order.ready) {
        order.accepted = false;
        updatedButtons[0].text = "Принял";
        newSawingMessage.accepted = "❎";
        await ctx.answerCbQuery("Вы отменили принятие заказа!");
      } else {
        await ctx.answerCbQuery("Вы уже завершили заказ!");
        return;
      }
    } else if (data === "ready") {
      if (!order.ready && order.accepted) {
        order.ready = true;
        ready_date = formattedDate;
        updatedButtons[1].text = "✅ Готов";
        newSawingMessage.accepted = `✅ ${order.accepted_date}`;
        newSawingMessage.ready = `✅ ${ready_date}`;
        await ctx.answerCbQuery("Вы завершили заказ!");
      } else if (order.ready && order.accepted) {
        order.ready = false;
        updatedButtons[1].text = "Готов";
        newSawingMessage.accepted = `✅ ${order.accepted_date}`;
        newSawingMessage.ready = "❎";
        await ctx.answerCbQuery("Вы отменили завершение заказа!");
      } else {
        await ctx.answerCbQuery("Вы еще не приняли заказ!");
        return;
      }
    }

    
    await this.orderService.updateOrder(message_id, {
        ...order,
        accepted_date,
        ready_date,
      });
  }
}
