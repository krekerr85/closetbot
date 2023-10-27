import {
  InlineKeyboardButton,
} from "telegraf/typings/core/types/typegram";
import {  OrderDTO, OrderT } from "../types/orderType";
import { TUser } from "../types/userType";
import fs from "fs";
import { OrderService } from "../services/botServices/order.service";
import { Types } from "mongoose";
import { botT } from "../types/telegramType";

export class UserOrder {
  private bot;
  public order;
  private readonly orderType;
  private readonly orderService;
  private readonly orderWatcherId;
  constructor(
    order: OrderDTO,
    bot: botT,
    orderWatcherId: Types.ObjectId,
    orderType: string,
  ) {
    this.order = order;
    this.orderType = orderType;
    this.bot = bot;
    this.orderWatcherId = orderWatcherId;
    this.orderService = new OrderService();
  }

  
}
