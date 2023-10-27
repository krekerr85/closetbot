import { UserOrder } from "../../classes/UserOrder";
import { OrderMessageT } from "../../types/orderType";
import { OrderWatcherModel } from "../../mongo/schemas/order_watcher.model";
import { botT } from "../../types/telegramType";

export class OrderWatcherService {
  public readonly usersOrders: UserOrder[] = [];
  constructor() {}

  async createOrderWatcher(bot: botT, closet_name: string, user_id: number) {
    const messageText = `${closet_name} \nРаспил \n❎ \n❎ \nДвери \n❎ \n❎`;
    const message = await bot.telegram.sendMessage(user_id, messageText);
    const sawingMessage: OrderMessageT = {
      title: closet_name,
      userType: "Распил",
      accepted: "❎",
      ready: "❎",
    };
    const doorMessage: OrderMessageT = {
      title: closet_name,
      userType: "Двери",
      accepted: "❎",
      ready: "❎",
    };
    return await OrderWatcherModel.create({
      closet_name,
      user_id,
      message_id: message.message_id,
      sawingMessage,
      doorMessage,
    });
  }
}
