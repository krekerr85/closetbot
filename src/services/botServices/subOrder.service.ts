import { SubOrderModel } from "../../mongo/schemas/sub_order.model";
import { OrderDTO, SubOrderT } from "../../types/orderType";
import fs from "fs";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { botT } from "../../types/telegramType";
import { Types } from "mongoose";
import { UserEnum } from "../../Enums/UserEnum";
import path from "path";
import { getFormattedDate, markdownV2Format } from "../../utils/functions";
import { doorTypes } from "../../types/doorType";
import { UserService } from "./user.service";
import { GoogleSheetService } from "./google_sheet.service";
import { sizeDir } from "../../types/sizeType";
const filesDirectory = path.join(__dirname, "../../../static_files");

export class SubOrderService {
  private readonly userService: UserService;
  private readonly googleSheetService: GoogleSheetService;
  constructor() {
    this.userService = new UserService();
    this.googleSheetService = new GoogleSheetService();
  }
  async createSubOrders(
    bot: botT,
    order: OrderDTO,
    order_id: Types.ObjectId,
    order_num: number
  ) {
    const { size, comment, color, door_type } = order;

    const [file1_path, file1_name, file2_path, file2_name] =
      await this.getOrderFiles(size, color, door_type);
    const file1Data = fs.createReadStream(file1_path);

    const file2Data = fs.createReadStream(file2_path);

    const buttons: InlineKeyboardButton[] = [
      { text: "Принял", callback_data: "accepted" },
      { text: "Готов", callback_data: "ready" },
    ];
    const keyboard: InlineKeyboardButton[][] = [[...buttons]];
    const userSawing = await this.userService.getUserByRole("sawing");
    const userDoor = await this.userService.getUserByRole("door");
    const priceDoc = (await this.googleSheetService.getPriceDoc(
      order
    ))!.toObject();
    const { additional_text, priceLey, price, insert, opening } = priceDoc;

    let messageIds;
    if (userSawing?.user_id) {
      const filesMessage = await bot.telegram.sendMediaGroup(userSawing?.user_id, [
        {
          media: { source: file1Data, filename: file1_name },
          type: "document",
        },
        {
          media: { source: file2Data, filename: file2_name },
          type: "document",
        },
      ]);
      messageIds = filesMessage.map((fileMessage) => fileMessage.message_id);
    }
    const messageTitleDoor = `№${order_num} (${getFormattedDate(
      new Date()
    )})\n(${comment})\n${additional_text}\nПроем: ${opening}\nВставка: ${insert}\nЦена: ${price}`;
    const messageTitleSawing = `№${order_num}\nШкаф ${size} (${color})(${door_type})\n(${comment})(${getFormattedDate(
      new Date()
    )})`;

    if (userSawing?.user_id) {
      const sawingMessage = await bot.telegram.sendMessage(
        userSawing?.user_id,
        markdownV2Format(messageTitleSawing),
        {
          reply_markup: {
            inline_keyboard: keyboard,
          },
          parse_mode: "MarkdownV2",
        }
      );

      const newSubSawingOrder = {
        user_id: sawingMessage.chat.id,
        message_id: sawingMessage.message_id,
        messageIds: messageIds,
        order_id,
        order_type: "sawing",
      };
      await SubOrderModel.create(newSubSawingOrder);
    }
 
    if (userDoor?.user_id) {
      const doorMessage = await bot.telegram.sendPhoto(
        userDoor?.user_id,
        `${process.env.WEB_APP}/images_door/${sizeDir[size]}/${color}/door.jpg`,
        {
          caption: markdownV2Format(messageTitleDoor),
          reply_markup: {
            inline_keyboard: keyboard,
          },
          parse_mode: "MarkdownV2",
        }
      );

      const newSubDoorOrder = {
        user_id: doorMessage.chat.id,
        message_id: doorMessage.message_id,
        order_id,
        order_type: "door",
      };
      await SubOrderModel.create(newSubDoorOrder);
    }
  }

  getOrderFiles(
    size: string,
    color: string,
    door_type: string
  ): Promise<string[]> {
    const filePath: string = path.join(
      filesDirectory,
      `files/${size}/${doorTypes[door_type]}/${color}`
    );
    const fileArr: string[] = [];
    return new Promise((res, rej) => {
      fs.readdir(filePath, (err, files) => {
        if (err) {
          console.error("Ошибка чтения директории:", err);
          rej();
        }
        for (const file of files) {
          fileArr.push(path.join(filePath, file), file);
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
