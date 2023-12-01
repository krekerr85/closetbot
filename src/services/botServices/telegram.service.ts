import { OrderT, OrderDTO, SubOrderT } from "../../types/orderType";
import { SubOrderService } from "./subOrder.service";
import { getFormattedDate, markdownV2Format } from "../../utils/functions";
import { botT, ctxT } from "../../types/telegramType";
import { OrderService } from "./order.service";
import { Types } from "mongoose";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { SubOrderModel } from "../../mongo/schemas/sub_order.model";
import { ParamsModel } from "../../mongo/schemas/params.model";
import { GoogleSheetService } from "./google_sheet.service";
import { Markup } from "telegraf";
import { UserService } from "./user.service";
import { TUser } from "../../types/userType";
import { UserModel } from "../../mongo/schemas/user.model";
import { OrderModel } from "../../mongo/schemas/order.model";
import cron from "node-cron";
interface StateFunctions {
  [key: string]: (ctx: ctxT) => void;
}
export class TelegramService {
  private readonly orderService;
  private readonly subOrderService;
  private readonly googleSheetService;
  private readonly userService;
  private readonly states: StateFunctions;
  constructor(private readonly bot: botT) {
    this.googleSheetService = new GoogleSheetService();
    this.userService = new UserService();

    this.subOrderService = new SubOrderService();
    this.orderService = new OrderService(this.googleSheetService);
    this.states = {
      accepted: (ctx: ctxT) => {
        this.handleAcceptState(ctx);
      },
      ready: (ctx: ctxT) => {
        this.handleReadyState(ctx);
      },
      delete: (ctx: ctxT) => {
        this.handleDeleteState(ctx);
      },
      confirmDelete: (ctx: ctxT) => {
        this.handleConfirmDeteteState(ctx);
      },
      cancelDelete: (ctx: ctxT) => {
        this.handleCancelDeleteState(ctx);
      },
    };
    this.init();

    const cronJob = cron.schedule("0 */45 * * *", async () => {
      // TODO сделать каждые 5 минут
      this.checkExpiredOrders();
    });
    const cronJob2 = cron.schedule("0 0 * * *", async () => {
      // TODO сделать каждые 5 минут
      await this.googleSheetService.init();
    });
  }

  async init() {
    UserModel.watch().on("change", async (data) => {
      const role = data?.updateDescription?.updatedFields?.role;
      if (!role) {
        return;
      }
      const user_id = data.documentKey;
      const userDoc = await this.userService.getUserByid(user_id);
      if (!userDoc) {
        return;
      }
      if (role === "watcher") {
        this.bot.telegram.sendMessage(
          userDoc.user_id,
          `Привет, ваша роль сменилась на ${role}!`,
          Markup.keyboard([
            Markup.button.webApp(
              "Конструктор",
              process.env.WEB_APP || "localhost:3001"
            ),
          ]).resize()
        );
      } else {
        this.bot.telegram.sendMessage(
          userDoc.user_id,
          `Привет, ваша роль сменилась на ${role}!`,
          {
            reply_markup: { remove_keyboard: true },
          }
        );
      }
    });

    this.bot.start(async (ctx) => {
      await this.bot.telegram.setMyCommands([
        { command: "/reload", description: "Обновить гугл таблицу" },
      ]);
      const userSender: TUser = {
        user_id: ctx.update.message.from.id,
        first_name: ctx.update.message.from.first_name,
        last_name: ctx.update.message.from?.last_name,
        username: ctx.update.message.from?.username,
      };
      const user = await this.userService.createUser(userSender);
      if (user?.role === "watcher") {
        return ctx.reply(
          `Привет, ${ctx.update.message.from.first_name}!`,
          Markup.keyboard([
            Markup.button.webApp(
              "Конструктор",
              process.env.WEB_APP || "localhost:3001"
            ),
          ]).resize()
        );
      } else {
        return ctx.reply(`Привет, ${ctx.update.message.from.first_name}!`);
      }
    });

    this.bot.command("reload", async (ctx) => {
      await this.googleSheetService.init();
    });

    this.bot.on("callback_query", async (ctx) => {
      console.log(ctx);
      // @ts-ignore

      await this.updateState(ctx);
    });
  }

  async createOrder(order: OrderDTO) {
    const orderDocument = await this.orderService.createOrder(this.bot, order);

    const { _id, order_num } = orderDocument;

    await this.subOrderService.createSubOrders(
      this.bot,
      order,
      _id,
      order_num!
    );
  }

  async updateState(ctx: ctxT) {
    // @ts-ignore
    const data: string = ctx.update.callback_query.data;
    if (!data) {
      return;
    }
    const handler = this.states[data];
    return await handler(ctx);
  }

  async performersSet(){
    const doorUsers = await UserModel.find({ role: "door" });
    const sawingUsers = await UserModel.find({ role: "sawing" });
    if (doorUsers.length === 1 && sawingUsers.length === 1) {
      return true;
    }
    return false;
  }
  async checkExpiredOrders() {
    try {
      const params = await ParamsModel.findOne(); // Получаем объект параметров из базы данных
      const daysForProduction = params?.daysForProduction || 4;
      const hoursForProcessing = params?.hoursForProcessing || 3;
      // Получите заказы из базы данных, у которых accepted_date имеет значение null и созданы более 4 часов назад
      const expiredNotAcceptedOrders = await SubOrderModel.find({
        accepted_date: null,
        date_created: {
          $lt: new Date(Date.now() - hoursForProcessing * 60 * 60 * 1000),
        },
        notificationSent: false, // Поле notificationSent равно false
      });
      const expiredNotReadyOrders = await SubOrderModel.find({
        accepted_date: { $ne: null }, // Поле accepted_date не является null
        ready_date: null, // Поле ready_date равно null
        date_created: {
          $lt: new Date(Date.now() - daysForProduction * 24 * 60 * 60 * 1000),
        },
        notificationSent: false, // Поле notificationSent равно false
      });
      for (const subOrder of expiredNotAcceptedOrders) {
        await this.bot.telegram.sendMessage(
          subOrder.user_id,
          "Просрочена дата принятия заказа!",
          {
            reply_to_message_id: subOrder.message_id,
          }
        );
        await SubOrderModel.findByIdAndUpdate(subOrder._id, {
          notificationSent: true,
        });
      }
      for (const subOrder of expiredNotReadyOrders) {
        await this.bot.telegram.sendMessage(
          subOrder.user_id,
          "Просрочена дата изготовления заказа!",
          {
            reply_to_message_id: subOrder.message_id,
          }
        );
        await SubOrderModel.findByIdAndUpdate(subOrder._id, {
          notificationSent: true,
        });
      }
    } catch (error) {
      console.error("Ошибка при проверке заказов:", error);
    }
  }
  async loadGoogleSheetData() {
    setInterval(() => {
      this.googleSheetService.init();
    }, 24 * 60 * 60 * 1000);
  }

  async handleAcceptState(ctx: ctxT) {
    if (!ctx.update.callback_query.message) {
      throw Error("Message not found");
    }
    const { message_id } = ctx.update.callback_query.message;

    //@ts-ignore
    const subOrder: SubOrderT =
      await this.subOrderService.getSubOrderByMessageId(message_id);
    if (!subOrder) {
      throw Error("SubOrder not found");
    }

    const order = await this.orderService.getOrderById(subOrder.order_id);
    if (!order) {
      throw Error("Order not found");
    }

    let updatedButtons: InlineKeyboardButton[] =
      // @ts-ignore
      ctx.update.callback_query.message!.reply_markup!.inline_keyboard[0];

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
    await this.updateSubOrderState(subOrder, order, message_id, updatedButtons);

    const buttons: InlineKeyboardButton[] = [
      { text: "Удалить заказ", callback_data: "delete" },
    ];
    const keyboard: InlineKeyboardButton[][] = [[...buttons]];
    await this.updateOrderState(order, keyboard);
  }

  async handleReadyState(ctx: ctxT) {
    if (!ctx.update.callback_query.message) {
      throw Error("Message not found");
    }
    const { message_id } = ctx.update.callback_query.message;

    const subOrder: SubOrderT | undefined = (
      await this.subOrderService.getSubOrderByMessageId(message_id)
    )?.toObject();
    if (!subOrder) {
      throw Error("SubOrder not found");
    }

    const order = await this.orderService.getOrderById(subOrder.order_id);
    if (!order) {
      throw Error("Order not found");
    }

    let updatedButtons: InlineKeyboardButton[] =
      // @ts-ignore
      ctx.update.callback_query.message!.reply_markup!.inline_keyboard[0];

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

    await this.updateSubOrderState(subOrder, order, message_id, updatedButtons);
    const done = await this.checkOrderDone(order);
    let buttons: InlineKeyboardButton[];
    if (!done) {
      buttons = [{ text: "Удалить заказ", callback_data: "delete" }];
    } else {
      buttons = [];
    }
    const keyboard: InlineKeyboardButton[][] = [[...buttons]];
    await this.updateOrderState(order, keyboard);
  }
  async checkOrderDone(order: OrderT) {
    const subOrders = await SubOrderModel.find({ order_id: order._id });
    for (const subOrder of subOrders) {
      if (!subOrder.ready_date) {
        return false;
      }
    }
    return true;
  }
  async handleDeleteState(ctx: ctxT) {
    if (!ctx.update.callback_query.message) {
      throw Error("Message not found");
    }
    const { message_id } = ctx.update.callback_query.message;

    const order = await this.orderService.getOrderByMessageId(message_id);
    if (!order) {
      throw Error("Order not found");
    }

    const user_id = ctx.update.callback_query.from.id;
    if (!user_id) {
      throw Error("User not found");
    }

    const buttons: InlineKeyboardButton[] = [
      { text: "Подтвердить удаление", callback_data: "confirmDelete" },
      { text: "Отменить удаление", callback_data: "cancelDelete" },
    ];
    const keyboard: InlineKeyboardButton[][] = [[...buttons]];

    const replyMessage = await this.getOrderMessage(order);
    await this.bot.telegram.editMessageText(
      user_id,
      message_id,
      undefined,
      markdownV2Format(`${replyMessage}`),
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
        parse_mode: "MarkdownV2",
      }
    );
  }
  async handleConfirmDeteteState(ctx: ctxT) {
    if (!ctx.update.callback_query.message) {
      throw Error("Message not found");
    }
    const { message_id } = ctx.update.callback_query.message;

    const order = await this.orderService.getOrderByMessageId(message_id);
    if (!order) {
      throw Error("Order not found");
    }

    const subOrders = await this.subOrderService.getSubOrdersByOrderId(
      order._id
    );
    if (!subOrders) {
      throw Error("SubOrders not found");
    }

    await this.deleteOrder(order);

    for (const subOrder of subOrders) {
      this.deteleSubOrder(subOrder.toObject(), order);
    }

    await this.googleSheetService.deleteOrder(order.order_num);
  }
  async handleCancelDeleteState(ctx: ctxT) {
    if (!ctx.update.callback_query.message) {
      throw Error("Message not found");
    }
    const { message_id } = ctx.update.callback_query.message;
    const user_id = ctx.update.callback_query.from.id;

    const order = await this.orderService.getOrderByMessageId(message_id);
    if (!order) {
      throw Error("Order not found");
    }

    const buttons: InlineKeyboardButton[] = [
      { text: "Удалить заказ", callback_data: "delete" },
    ];
    const keyboard: InlineKeyboardButton[][] = [[...buttons]];

    const message = await this.getOrderMessage(order);

    await this.bot.telegram.editMessageText(
      user_id,
      message_id,
      undefined,
      markdownV2Format(`${message}`),
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
        parse_mode: "MarkdownV2",
      }
    );
  }

  async deteleSubOrder(subOrder: SubOrderT, order: OrderT) {
    const message = await this.getSubOrderPrevMessage(subOrder, order);

    if (subOrder.order_type === 'door'){
      await this.bot.telegram.editMessageCaption(
        subOrder.user_id,
        subOrder.message_id,
        undefined,
        markdownV2Format(`~${message}~`),
        {
          reply_markup: {
            inline_keyboard: [],
          },
          parse_mode: "MarkdownV2",
        }
      );
    }else if (subOrder.order_type === 'sawing'){
      await this.bot.telegram.editMessageText(
        subOrder.user_id,
        subOrder.message_id,
        undefined,
        markdownV2Format(`~${message}~`),
        {
          reply_markup: {
            inline_keyboard: [],
          },
          parse_mode: "MarkdownV2",
        }
      );
      for (const messageId of subOrder.messageIds) {
        await this.bot.telegram.deleteMessage(subOrder.user_id,messageId);
      }

    }
    

    this.bot.telegram.sendMessage(
      subOrder.user_id,
      "Данный заказ был удален оператором",
      {
        reply_to_message_id: subOrder.message_id,
      }
    );
    await SubOrderModel.deleteOne({ _id: subOrder._id });
  }

  async deleteOrder(order: OrderT) {
    const message = await this.getOrderMessage(order);

    for (const watcher of order.messages) {
      await this.bot.telegram.editMessageText(
        watcher.user_id,
        watcher.message_id,
        undefined,
        markdownV2Format(`~${message}~`),
        {
          reply_markup: {
            inline_keyboard: [],
          },
          parse_mode: "MarkdownV2",
        }
      );
    }
    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { status: "Deleted" } }
    );
  }

  async updateSubOrderState(
    subOrder: SubOrderT,
    order: OrderT,
    message_id: number,
    updatedButtons: InlineKeyboardButton[]
  ) {
    const message = await this.getSubOrderPrevMessage(subOrder, order);

    await this.subOrderService.updateSubOrder(message_id, subOrder);
    if (subOrder.order_type === 'door'){
      await this.bot.telegram.editMessageCaption(
        subOrder.user_id,
        message_id,
        undefined,
        markdownV2Format(message),
        {
          reply_markup: {
            inline_keyboard: [updatedButtons],
          },
          parse_mode: "MarkdownV2",
        }
      );
    }else{
      await this.bot.telegram.editMessageText(
        subOrder.user_id,
        message_id,
        undefined,
        markdownV2Format(message),
        {
          reply_markup: {
            inline_keyboard: [updatedButtons],
          },
          parse_mode: "MarkdownV2",
        }
      );
    }
    
  }
  async updateOrderState(order: OrderT, keyboard: InlineKeyboardButton[][]) {
    const message = await this.getOrderMessage(order);
    for (const watcher of order.messages) {
      await this.bot.telegram.editMessageText(
        watcher.user_id,
        watcher.message_id,
        undefined,
        markdownV2Format(`${message}`),
        {
          reply_markup: {
            inline_keyboard: keyboard,
          },
          parse_mode: "MarkdownV2",
        }
      );
    }
  }
  async getOrderMessage(order: OrderT) {
    const [subOrderDoor, subOrderSawing] =
      await this.subOrderService.getSubOrdersByOrderId(order._id);
    const message = {
      title: order.title,
      doorAccepted: subOrderDoor.accepted_date
        ? `✅ Принял (${getFormattedDate(subOrderDoor.accepted_date)})`
        : "❎",
      doorReady: subOrderDoor.ready_date
        ? `✅ Готов (${getFormattedDate(subOrderDoor.ready_date)})`
        : "❎",
      sawingAccepted: subOrderSawing.accepted_date
        ? `✅ Принял (${getFormattedDate(subOrderSawing.accepted_date)})`
        : "❎",
      sawingReady: subOrderSawing.ready_date
        ? `✅ Готов (${getFormattedDate(subOrderSawing.ready_date)})`
        : "❎",
    };
    const fullMessage = `${message.title}\nРаспил \n${message.sawingAccepted} \n${message.sawingReady} \nДвери \n${message.doorAccepted} \n${message.doorReady}`;
    return fullMessage;
  }

  async getSubOrderPrevMessage(subOrder: SubOrderT, order: OrderT) {
    let message = "";
    if (subOrder.order_type === "sawing") {
      message = `№${order.order_num}\nШкаф ${order.order.size} (${
        order.order.color
      })(${order.order.door_type})\n(${order.order.comment})(${getFormattedDate(
        order.date_created
      )})`;
    } else if (subOrder.order_type === "door") {
      // message = `№${order.order_num}\nШкаф ${order.order.size} (${
      //   order.order.color
      // })(${order.order.door_type})\n(${order.order.comment})(${getFormattedDate(
      //   order.date_created
      // )})\n${order.additional_text}\n ${order.priceLey}`;

      message = `№${order.order_num} (${getFormattedDate(
        order.date_created
      )})\n(${order.order.comment})\n${order.additional_text}\nПроем: ${
        order.opening
      }\nВставка: ${order.insert}\nЦена: ${order.price}`;
    }

    return message;
  }
}
