import { Context, NarrowedContext, Telegraf } from "telegraf";
import { UserOrder } from "../../classes/UserOrder";
import { TOrder } from "../../types/orderType";
import { UserService } from "./userService";
import {
  CallbackQuery,
  InlineKeyboardButton,
  Update,
} from "telegraf/typings/core/types/typegram";
import { OrderService } from "./orderService";
import { OrderWatcherModel } from "../../mongo/schemas/order_watcher";

export class OrderWatcherService {
  private readonly userService;
  private readonly bot;
  private readonly orderService;
  constructor(bot: Telegraf<Context<Update>>) {
    this.userService = new UserService();
    this.bot = bot;
    this.orderService = new OrderService();
  }
  async createOrder(
    order: Omit<
      TOrder,
      | "firstName"
      | "lastName"
      | "userId"
      | "accepted"
      | "ready"
      | "orderWatcherId"
    >
  ) {
    const userWatcherDocument = await this.userService.getUserInfo(6637928149);
    const { userId, dateCreated } = userWatcherDocument!.toObject();
    if (!userId) {
      return;
    }
    console.log("1");
    const messageText = `${order.closetName} \n Распил \n ❎ \n ❎`;
    const message = await this.bot.telegram.sendMessage(userId, messageText);
    const orderWatcherDocument = await OrderWatcherModel.create({
      userId,
      dateCreated,
      messageId: message.message_id,
    });
    const orderWatcherId = orderWatcherDocument._id;
    const userSawingDocument = await this.userService.getUserInfo(795779725);
    const userSawingOrder = new UserOrder(
      order,
      userSawingDocument!.toObject(),
      this.bot,
      orderWatcherId
    );
  }
  async updateState(
    ctx: NarrowedContext<
      Context<Update>,
      Update.CallbackQueryUpdate<CallbackQuery>
    >
  ) {
    const messageId = ctx.update.callback_query.message!.message_id;
    const data = ctx.update.callback_query.data;
    const order = await this.orderService.getOrderByOrderId(messageId);
    if (!order) {
      ctx.answerCbQuery();
      return;
    }
    const orderWatcher = await OrderWatcherModel.findOne({
      _id: order.orderWatcherId,
    });
    if (!orderWatcher) {
      return;
    }
    let newMessage = {
      title: order.closetName,
      userType: "Распил",
      accepted: "❎",
      ready: "❎",
    };

    const currentDate = new Date();

    const year = currentDate.getFullYear().toString().slice(-2); // Получаем последние две цифры года
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Получаем месяц (с нулем впереди, если месяц < 10)
    const day = ("0" + currentDate.getDate()).slice(-2); // Получаем день (с нулем впереди, если день < 10)

    const formattedDate = `${day}.${month}.${year}`;

   
    const updatedButtons: InlineKeyboardButton[] =
     // @ts-ignore
      ctx.update.callback_query.message.reply_markup!.inline_keyboard[0];
    let acceptedDate;
    let readyDate;

    if (data === "accepted") {
      if (!order.accepted) {
        order.accepted = true;
        updatedButtons[0].text = "✅ Принял";
        newMessage.accepted = `✅ ${formattedDate}`;
        await ctx.answerCbQuery("Вы приняли заказ!");
        acceptedDate = formattedDate;
      } else if (order.accepted && !order.ready) {
        order.accepted = false;
        updatedButtons[0].text = "Принял";
        newMessage.accepted = "❎";
        await ctx.answerCbQuery("Вы отменили принятие заказа!");
      } else {
        await ctx.answerCbQuery("Вы уже завершили заказ!");
        return;
      }
    } else if (data === "ready") {
      if (!order.ready && order.accepted) {
        order.ready = true;
        updatedButtons[1].text = "✅ Готов";
        newMessage.accepted = `✅ ${order.acceptedDate}`;
        newMessage.ready = `✅ ${formattedDate}`;
        await ctx.answerCbQuery("Вы завершили заказ!");
        readyDate = formattedDate;
      } else if (order.ready && order.accepted) {
        order.ready = false;
        updatedButtons[1].text = "Готов";
        newMessage.accepted = `✅ ${order.acceptedDate}`;
        newMessage.ready = "❎";
        await ctx.answerCbQuery("Вы отменили завершение заказа!");
      } else {
        await ctx.answerCbQuery("Вы еще не приняли заказ!");
        return;
      }
    }

    await this.orderService.updateOrder(messageId, {
      ...order.toObject(),
      acceptedDate,
      readyDate,
    });

    await ctx.editMessageReplyMarkup({
      inline_keyboard: [updatedButtons],
    });
    const fullMessage = `${newMessage.title} \n ${newMessage.userType} \n ${newMessage.accepted} \n ${newMessage.ready}`;
    await this.bot.telegram.editMessageText(
      orderWatcher.userId,
      orderWatcher.messageId,
      undefined,
      fullMessage
    );
  }
}
