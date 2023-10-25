import {
  InlineKeyboardButton,
  Update,
} from "telegraf/typings/core/types/typegram";
import { TOrder } from "../types/orderType";
import { Context, Telegraf } from "telegraf";
import { TUser } from "../types/userType";
import fs from "fs";
import { OrderService } from "../services/botServices/orderService";
import { Types } from "mongoose";
export type TState = {
  acceptedActive: boolean;
  readyActive: boolean;
};

export class UserOrder {
  private user;
  private bot;
  public order;
  private readonly orderService;
  private readonly orderWatcherId;
  constructor(
    order: Omit<
      TOrder,
      | "firstName"
      | "lastName"
      | "userId"
      | "accepted"
      | "ready"
      | "orderWatcherId"
    >,
    user: TUser,
    bot: Telegraf<Context<Update>>,
    orderWatcherId: Types.ObjectId
  ) {
    this.user = user;
    this.order = order;
    this.bot = bot;
    this.orderWatcherId = orderWatcherId;
    this.orderService = new OrderService();
    this.createOrder();
  }

  async createOrder() {
    const {
      orderNum,
      closetName,
      comment,
      file1Path,
      file1Name,
      file2Path,
      file2Name,
      dateCreated,
    } = this.order;

    const file1Data = fs.createReadStream(file1Path);

    const file2Data = fs.createReadStream(file2Path);
    try {
      const buttons: InlineKeyboardButton[] = [
        { text: "Принял", callback_data: "accepted" },
        { text: "Готов", callback_data: "ready" },
      ];
      const keyboard: InlineKeyboardButton[][] = [[...buttons]];
      // Отправить два файла в одном сообщении с общим комментарием и кнопками
      await this.bot.telegram.sendMediaGroup(this.user.userId, [
        {
          media: { source: file1Data, filename: file1Name },
          type: "document",
        },
        {
          media: { source: file2Data, filename: file2Name },
          type: "document",
        },
      ]);
      const message = await this.bot.telegram.sendMessage(
        this.user.userId,
        closetName,
        {
          reply_markup: {
            inline_keyboard: keyboard,
          },
        }
      );

      const newOrder: TOrder = {
        orderNum,
        closetName,
        comment,
        file1Path,
        file1Name,
        file2Path,
        file2Name,
        dateCreated,
        accepted: false,
        ready: false,
        userId: message.chat.id,
        messageId: message.message_id,
        // @ts-ignore
        firstName: message.chat!.first_name,
        // @ts-ignore
        lastName: message.chat!.last_name!,
        orderWatcherId: this.orderWatcherId,
      };
      await this.orderService.createOrder(newOrder);
    } catch (e) {
      console.log(e);
    }
  }
}
