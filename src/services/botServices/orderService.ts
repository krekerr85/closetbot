import { OrderModel } from "../../mongo/schemas/order";
import { TOrder } from "../../types/orderType";



export class OrderService {
    async createOrder(order: TOrder){
        try{
            return await OrderModel.create(order);
        }catch(e){
            console.log(e);
        }
        
    }
    
    async getOrderByOrderId(orderId: Number){
        return await OrderModel.findOne({orderId});
    }
}
