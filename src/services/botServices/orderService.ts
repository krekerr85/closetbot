import { OrderModel } from "../../mongo/schemas/order";
import { TOrder } from "../../types/orderType";

export class OrderService {
  async createOrder(order: TOrder) {
    try {
      return await OrderModel.create(order);
    } catch (e) {
      console.log(e);
    }
  }

  async getOrderByOrderId(messageId: Number) {
    return await OrderModel.findOne({ messageId });
  }

  async updateOrder(messageId: number, order: TOrder) {
    return await OrderModel.updateOne(
      { messageId }, // Указываем фильтр для поиска документа по его ObjectId
      { $set: order } // Устанавливаем новые данные с помощью оператора $set
    );
  }
}
