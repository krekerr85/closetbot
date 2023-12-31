import { OrderDTO } from '../types/orderType';
import { TelegramService } from '../services/botServices/telegram.service';
import { Request, Response } from 'express';
// Middleware для проверки аутентификации
class TelegramController {
  private readonly telegramService: TelegramService
  constructor( telegramService: TelegramService){
    this.telegramService = telegramService;
  }
  async createOrder(req: Request, res: Response){
    const orders: OrderDTO[] = req.body;
    try{
      const isSet = await this.telegramService.performersSet();
      console.log('isSet', isSet)
      if (!isSet){
        res.status(505).json({ success: false, message: 'Performers not set'});
        console.log('not set')
        return;
      }
      for (const order of orders) {
        await this.telegramService.createOrder(order);
      }
      res.status(200).json({ success: true, message: 'Orders created successfully' });
    }catch(e){
      console.log(e);
      res.status(500).json({ success: false, message: 'Error creating orders', error: e });
    }
    
  }

}

export default TelegramController;