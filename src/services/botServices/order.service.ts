import { OrderDTO, OrderT } from "../../types/orderType";
import { OrderModel } from "../../mongo/schemas/order.model";
import { botT } from "../../types/telegramType";
import { getFormattedDate } from "../../utils/functions";
import { doorTypes } from "../../types/doorType";

export class OrderService {
  async createOrder(bot: botT, order: OrderDTO, user_id: number) {
    const { size, color, door_type, comment } = order;
    const messageTextTitle = `Шкаф ${size} (${color})(${
      doorTypes[door_type]
    })(${comment})(${getFormattedDate(new Date())})`;
    const messageText = `${messageTextTitle} \nРаспил \n❎ \n❎ \nДвери \n❎ \n❎`;
    const message = await bot.telegram.sendMessage(user_id, messageText);

    return await OrderModel.create({
      order,
      user_id,
      message_id: message.message_id,
      title: messageTextTitle,
    });
  }

  async updateOrder(message_id: number, order: OrderT) {
    return await OrderModel.updateOne({ message_id }, { $set: order });
  }

  async getOrderByOrderId(message_id: number) {
    return await OrderModel.findOne({ message_id });
  }
}
