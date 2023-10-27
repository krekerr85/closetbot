import { OrderModel } from "../../mongo/schemas/order.model";
import { OrderDTO, OrderT } from "../../types/orderType";
import fs from "fs";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { botT } from "../../types/telegramType";
import { Types } from "mongoose";
import { UserEnum } from "../../Enums/UserEnum";
export class OrderService {
  async getOrderByOrderId(message_id: number) {
    return await OrderModel.findOne({ message_id });
  }

  async updateOrder(message_id: number, order: OrderT) {
    return await OrderModel.updateOne({ message_id }, { $set: order });
  }

  async createOrder(
    bot: botT,
    order: OrderDTO,
    user_id: UserEnum,
    order_watcher_id: Types.ObjectId,
    order_type: string
  ) {
    const {
      order_num,
      closet_name,
      comment,
      file1_path,
      file1_name,
      file2_path,
      file2_name,
      date_created,
    } = order;

    const file1Data = fs.createReadStream(file1_path);

    const file2Data = fs.createReadStream(file2_path);

    const buttons: InlineKeyboardButton[] = [
      { text: "Принял", callback_data: "accepted" },
      { text: "Готов", callback_data: "ready" },
    ];
    const keyboard: InlineKeyboardButton[][] = [[...buttons]];

    await bot.telegram.sendMediaGroup(user_id, [
      {
        media: { source: file1Data, filename: file1_name },
        type: "document",
      },
      {
        media: { source: file2Data, filename: file2_name },
        type: "document",
      },
    ]);

    const message = await bot.telegram.sendMessage(user_id, closet_name, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });

    const newOrder: OrderT = {
      order_num,
      closet_name,
      comment,
      file1_path,
      file1_name,
      file2_path,
      file2_name,
      date_created,
      user_id: message.chat.id,
      message_id: message.message_id,
      order_watcher_id,
      order_type,
    };
    await OrderModel.create(newOrder);
  }
}
