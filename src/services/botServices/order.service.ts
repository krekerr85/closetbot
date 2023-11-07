import { OrderDTO, OrderT } from "../../types/orderType";
import { OrderModel } from "../../mongo/schemas/order.model";
import { botT } from "../../types/telegramType";
import { getFormattedDate, markdownV2Format } from "../../utils/functions";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { GoogleSheetService } from "./google_sheet.service";

export class OrderService {
  constructor(private readonly googleSheetService: GoogleSheetService) {}

  async createOrder(bot: botT, order: OrderDTO, user_id: number) {
    const buttons: InlineKeyboardButton[] = [
      { text: "Удалить заказ", callback_data: "deleteOrder" },
    ];
    const keyboard: InlineKeyboardButton[][] = [[...buttons]];

    const { size, color, door_type, comment } = order;
    const order_num = new Date().getTime();
    const messageTextTitle = `№${order_num} Шкаф ${size} (${color})(${
      door_type
    })(${comment})(${getFormattedDate(new Date())})`;
    const messageText = `${messageTextTitle}\nРаспил \n❎ \n❎ \nДвери \n❎ \n❎`;
    const message = await bot.telegram.sendMessage(
      user_id,
      markdownV2Format(messageText),
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
        parse_mode: "MarkdownV2",
      }
    );

    const orderDoc = await OrderModel.create({
      order_num,
      order,
      user_id,
      message_id: message.message_id,
      title: messageTextTitle,
    });

    await this.googleSheetService.writeData(orderDoc.toObject());

    return orderDoc;
  }

  async updateOrder(message_id: number, order: OrderT) {
    return await OrderModel.updateOne({ message_id }, { $set: order });
  }

  async getOrderByMessageId(message_id: number) {
    return await OrderModel.findOne({ message_id });
  }
}
