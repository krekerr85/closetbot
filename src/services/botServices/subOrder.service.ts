import { SubOrderModel } from "../../mongo/schemas/sub_order.model";
import { OrderDTO, SubOrderT } from "../../types/orderType";
import fs from "fs";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { botT } from "../../types/telegramType";
import { Types } from "mongoose";
import { UserEnum } from "../../Enums/UserEnum";
import path from "path";
import { getFormattedDate } from "../../utils/functions";
const filesDirectory = path.join(__dirname, "../../../static");
export class SubOrderService {
  async createSubOrders(bot: botT, order: OrderDTO, order_id: Types.ObjectId) {
    const { size, comment, color, door_type } = order;

    const [file1_path, file1_name, file2_path, file2_name] = await this.getOrderFiles(
      size,
      color,
      door_type
    );
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

  getOrderFiles(
    size: string,
    color: string,
    door_type: string
  ): Promise<string[]> {
    const filePath: string = path.join(
      filesDirectory,
      `files/${size}/${door_type}/${color}`
    );
    const fileArr: string[] = [];
    return new Promise((res, rej) => {
      fs.readdir(filePath, (err, files) => {
        if (err) {
          console.error("Ошибка чтения директории:", err);
          rej();
        }
        for (const file of files){
          fileArr.push(path.join(
            filePath,
            file
          ), 
            file)
        }
        res(fileArr);
      });
    });
  }

  async updateSubOrder(message_id: number, subOrder: SubOrderT) {
    return await SubOrderModel.updateOne({ message_id }, { $set: subOrder });
  }

  async getSubOrderByMessageId(message_id: number) {
    return await SubOrderModel.findOne({ message_id });
  }
  async getSubOrdersByOrderId(order_id: Types.ObjectId) {
    return await SubOrderModel.find({ order_id }).sort({ order_type: 1 });
  }
}
