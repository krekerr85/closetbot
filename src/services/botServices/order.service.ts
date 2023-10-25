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

  async getOrderByOrderId(message_id: Number) {
    return await OrderModel.findOne({ message_id });
  }

  async updateOrder(message_id: number, order: TOrder) {
    return await OrderModel.updateOne(
      { message_id }, // Указываем фильтр для поиска документа по его ObjectId
      { $set: order } // Устанавливаем новые данные с помощью оператора $set
    );
  }
}
