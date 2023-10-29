import { SubOrderModel } from "../../mongo/schemas/sub_order.model";
import { OrderDTO, OrderT, SubOrderT } from "../../types/orderType";
import fs from "fs";
import {
  InlineKeyboardButton,
} from "telegraf/typings/core/types/typegram";
import { botT } from "../../types/telegramType";
import { Types } from "mongoose";
import { UserEnum } from "../../Enums/UserEnum";
import path from "path";
import { getFormattedDate } from "../../utils/functions";
const filesDirectory = path.join(__dirname, "../../../files");
export class SubOrderService {
  async createSubOrders(bot: botT, order: OrderDTO, order_id: Types.ObjectId) {
    const { order_num, size, comment, color, door_type} = order;

    const { file1_path, file1_name, file2_path, file2_name } =
      await this.getOrderFiles(size, color, door_type);
    const file1Data = fs.createReadStream(file1_path);

    const file2Data = fs.createReadStream(file2_path);

    const buttons: InlineKeyboardButton[] = [
      { text: "Принял", callback_data: "accepted" },
      { text: "Готов", callback_data: "ready" },
    ];
    const keyboard: InlineKeyboardButton[][] = [[...buttons]];

    await bot.telegram.sendMediaGroup(UserEnum.Sawing, [
      {
        media: { source: file1Data, filename: file1_name },
        type: "document",
      },
      {
        media: { source: file2Data, filename: file2_name },
        type: "document",
      },
    ]);

    const messageTitle = `Шкаф ${size} (${color})(${door_type})(${comment})(${getFormattedDate(
      new Date()
    )})`;

    const sawingMessage = await bot.telegram.sendMessage(
      UserEnum.Sawing,
      messageTitle,
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );
    const newSubSawingOrder: SubOrderT = {
      user_id: sawingMessage.chat.id,
      message_id: sawingMessage.message_id,
      order_id,
      order_type: "door",
    };
    await SubOrderModel.create(newSubSawingOrder);

    const doorMessage = await bot.telegram.sendMessage(
      UserEnum.Door,
      messageTitle,
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );

    const newSubDoorOrder: SubOrderT = {
      user_id: doorMessage.chat.id,
      message_id: doorMessage.message_id,
      order_id,
      order_type: "door",
    };
    await SubOrderModel.create(newSubDoorOrder);
  }

  async getOrderFiles(size: string, color: string, door_type: string) {
    const fileFindStr = `${size}_${door_type}_${color}`;
    const filePath = path.join(filesDirectory, `${size}_${door_type}_${color}`);
    console.log(filePath);
    // const file1_path, file1_name, file2_path, file2_name
    return {
      file1_path: "Сupe 2600 (CPU24).zip",
      file1_name: "Сupe 2600 (CPU24).zip",
      file2_path: "Cupe 2600 (3025MX).b3d",
      file2_name: "Cupe 2600 (3025MX).b3d",
    };
  }

  async updateSubOrder(message_id: number, subOrder: SubOrderT) {
    return await SubOrderModel.updateOne({ message_id }, { $set: subOrder });
  }

  async getSubOrderByMessageId(message_id: number) {
    return await SubOrderModel.findOne({ message_id });
  }
  async getSubOrdersByOrderId(order_id: Types.ObjectId){
    return await SubOrderModel.find({ order_id }).sort({ order_type: 1 });
  }
}
