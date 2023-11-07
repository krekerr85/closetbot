import { OrderT, OrderDTO, SubOrderT } from "../../types/orderType";
import { SubOrderService } from "./subOrder.service";
import { UserEnum } from "../../Enums/UserEnum";
import { getFormattedDate, markdownV2Format } from "../../utils/functions";
import { botT, ctxT } from "../../types/telegramType";
import { OrderService } from "./order.service";
import { OrderModel } from "../../mongo/schemas/order.model";
import { Types } from "mongoose";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { SubOrderModel } from "../../mongo/schemas/sub_order.model";
import { ParamsModel } from "../../mongo/schemas/params.model";
import { GoogleSheetService } from "./google_sheet.service";
import { Markup } from "telegraf";
import { UserService } from "./user.service";
import { TUser } from "../../types/userType";

export class TelegramService {
  private readonly orderService;
  private readonly subOrderService;
  private readonly googleSheetService;
  private readonly userService;

  constructor(private readonly bot: botT) {
    this.googleSheetService = new GoogleSheetService();
    this.userService = new UserService();

    this.subOrderService = new SubOrderService();
    this.orderService = new OrderService(this.googleSheetService);

    this.init();

    setInterval(() => {
      this.checkExpiredOrders();
    }, 60 * 5000);
  }

  async init() {
    const userWatchers = await this.userService.getUsersByRole('watcher');
    this.bot.start((ctx) => {
      
      const userSender: TUser = {
        user_id: ctx.update.message.from.id,
        first_name: ctx.update.message.from.first_name,
        last_name: ctx.update.message.from?.last_name,
        username: ctx.update.message.from?.username,
      };

      this.userService.createUser(userSender);
      
      if (userWatchers.includes(ctx.update.message.from.id) || ctx.update.message.from.id  === UserEnum.Watcher) {
        return ctx.reply(
          `Привет, ${ctx.update.message.from.first_name}!`,
          Markup.keyboard([
            Markup.button.webApp(
              "Конструктор",
              "https://zrealm.ru"
            ),
          ]).resize()
        );
      }
    });

    this.bot.on("callback_query", async (ctx) => {
      await this.updateState(ctx);
    });
  }

  async createOrder(order: OrderDTO) {
    const orderDocument = await this.orderService.createOrder(
      this.bot,
      order,
      UserEnum.Watcher
    );

    const { _id, order_num } = orderDocument;

    await this.subOrderService.createSubOrders(
      this.bot,
      order,
      _id,
      order_num!
    );
  }

  async updateState(ctx: ctxT) {
    const { message_id } = ctx.update.callback_query.message!;

    const subOrder: SubOrderT | undefined = (
      await this.subOrderService.getSubOrderByMessageId(message_id)
    )?.toObject();
    if (!subOrder) {
      const order = await this.orderService.getOrderByMessageId(message_id);
      if (!order) {
        return;
      }
      const subOrders = await this.subOrderService.getSubOrdersByOrderId(
        order._id
      );
      for (const subOrder of subOrders) {
        await this.updateSubOrderState(
          ctx,
          order.toObject(),
          subOrder.toObject(),
          subOrder.message_id
        );
      }
      await this.updateOrderState(order._id, order.toObject(), true);
    } else {
      const orderDocument = await OrderModel.findOne({
        _id: subOrder.order_id,
      });

      if (!orderDocument) {
        return;
      }
      const order: OrderT = orderDocument.toObject();
      const res = await this.updateSubOrderState(
        ctx,
        order,
        subOrder,
        message_id
      );
      if (!res) {
        return;
      }
      await this.updateOrderState(subOrder.order_id, order);
    }
  }

  async updateSubOrderState(
    ctx: ctxT,
    order: OrderT,
    subOrder: SubOrderT,
    message_id: number
  ) {
    // @ts-ignore
    const { data } = ctx.update.callback_query;
    let updatedButtons =
      // @ts-ignore
      ctx.update.callback_query.message!.reply_markup!.inline_keyboard[0];
    console.log(data);
    console.log(message_id);
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
    } else if (data === "deleteOrder") {
      updatedButtons = [];
      this.bot.telegram.sendMessage(
        subOrder.user_id,
        "Данный заказ был удален оператором",
        {
          reply_to_message_id: subOrder.message_id,
        }
      );
      order.status = "Cancelled";
      order.title = `~${order.title}~`;
    }

    await this.subOrderService.updateSubOrder(message_id, subOrder);
    await this.bot.telegram.editMessageText(
      subOrder.user_id,
      message_id,
      undefined,
      markdownV2Format(order.title),
      {
        reply_markup: {
          inline_keyboard: [updatedButtons],
        },
        parse_mode: "MarkdownV2",
      }
    );
    return true;
  }

  async updateOrderState(
    order_id: Types.ObjectId,
    order: OrderT,
    deleted: boolean = false
  ) {
    const buttons: InlineKeyboardButton[] = [
      { text: "Удалить заказ", callback_data: "deleteOrder" },
    ];
    const keyboard: InlineKeyboardButton[][] = [[...buttons]];
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
    let fullMessage = "";
    if (deleted) {
      fullMessage = `~${message.title}~ \nРаспил \n${message.sawingAccepted} \n${message.sawingReady} \nДверь \n${message.doorAccepted} \n${message.doorReady}`;
      await this.bot.telegram.editMessageText(
        order.user_id,
        order.message_id,
        undefined,
        markdownV2Format(fullMessage),
        {
          reply_markup: {
            inline_keyboard: [],
          },
          parse_mode: "MarkdownV2",
        }
      );
    } else {
      fullMessage = `${message.title} \nРаспил \n${message.sawingAccepted} \n${message.sawingReady} \nДверь \n${message.doorAccepted} \n${message.doorReady}`;
      await this.bot.telegram.editMessageText(
        order.user_id,
        order.message_id,
        undefined,
        markdownV2Format(fullMessage),
        {
          reply_markup: {
            inline_keyboard: keyboard,
          },
          parse_mode: "MarkdownV2",
        }
      );
    }
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
}
