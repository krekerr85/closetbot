import {
  InlineKeyboardButton,
  Update,
} from "telegraf/typings/core/types/typegram";
import { TOrder, TOrderDTO } from "../types/orderType";
import { Context, Telegraf } from "telegraf";
import { TUser } from "../types/userType";
import fs from "fs";
import { OrderService } from "../services/botServices/order.service";
import { Types } from "mongoose";

export class UserOrder {
  private user;
  private bot;
  public order;
  private readonly orderService;
  private readonly orderWatcherId;
  constructor(
    order: TOrderDTO,
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
      order_num,
      closet_name,
      comment,
      file1Path,
      file1Name,
      file2Path,
      file2Name,
      date_created,
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
      await this.bot.telegram.sendMediaGroup(this.user.user_id, [
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
        this.user.user_id,
        closet_name,
        {
          reply_markup: {
            inline_keyboard: keyboard,
          },
        }
      );

      const newOrder: TOrder = {
        order_num,
        closet_name,
        comment,
        file1Path,
        file1Name,
        file2Path,
        file2Name,
        date_created,
        accepted: false,
        ready: false,
        user_id: message.chat.id,
        message_id: message.message_id,
        // @ts-ignore
        first_name: message.chat!.first_name,
        // @ts-ignore
        order_watcher_id: this.orderWatcherId,
      };
      await this.orderService.createOrder(newOrder);
    } catch (e) {
      console.log(e);
    }
  }
}
