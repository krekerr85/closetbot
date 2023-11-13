import { OrderDTO, OrderT, TelegramMessageT } from "../../types/orderType";
import { OrderModel } from "../../mongo/schemas/order.model";
import { botT } from "../../types/telegramType";
import { getFormattedDate, markdownV2Format } from "../../utils/functions";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { GoogleSheetService } from "./google_sheet.service";
import { UserService } from "./user.service";
import { Types } from "mongoose";

export class OrderService {
  private readonly userService;
  constructor(private readonly googleSheetService: GoogleSheetService) {
    this.userService = new UserService();
  }

  async createOrder(bot: botT, order: OrderDTO) {
    const buttons: InlineKeyboardButton[] = [
      { text: "Удалить заказ", callback_data: "delete" },
    ];
    const keyboard: InlineKeyboardButton[][] = [[...buttons]];

    const { size, color, door_type, comment } = order;
    const order_num = new Date().getTime();
    const addInfo = await this.googleSheetService.getAddTextInfo(order);
    const priceLey = await this.googleSheetService.getPriceLeyInfo(order);
    const price = await this.googleSheetService.getPriceInfo(order);
    const messageTextTitle = `№${order_num}\nШкаф ${size} (${color})(${door_type})\n(${comment})(${getFormattedDate(
      new Date()
    )})\n${addInfo}\n ${priceLey}`;
    const messageText = `${messageTextTitle}\nРаспил \n❎ \n❎ \nДвери \n❎ \n❎`;
    const userWatchers = await this.userService.getUsersByRole("watcher");
    const messages: TelegramMessageT[] = [];
    for (const user of userWatchers) {
      const message = await bot.telegram.sendMessage(
        user,
        markdownV2Format(messageText),
        {
          reply_markup: {
            inline_keyboard: keyboard,
          },
          parse_mode: "MarkdownV2",
        }
      );
      messages.push({
        message_id : message.message_id,
        user_id: user,
      });
    }
    const orderDoc = await OrderModel.create({
      order_num,
      order,
      messages,
      addInfo,
      price,
      priceLey,
      title: messageTextTitle,
    });
    await this.googleSheetService.writeData(orderDoc.toObject());

    return orderDoc;
  }

  async deleteOrder(order_id: Types.ObjectId) {
    return await OrderModel.deleteOne({ _id: order_id });
  }
  async getOrderById(_id: Types.ObjectId) {
    return await OrderModel.findOne({ _id });
  }

  async getOrderByMessageId(message_id: number)  {
    const order = await OrderModel.findOne({
      'messages.message_id': message_id
    });
  
    return order;
  }
}
