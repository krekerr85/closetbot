import { Context, NarrowedContext, Telegraf } from "telegraf";
import { TOrder } from "../types/orderType";
import { TUser } from "../types/userType";
import { TState, UserOrder } from "./Order";
import {
  CallbackQuery,
  Update,
  User,
} from "telegraf/typings/core/types/typegram";
import { UserService } from "../services/botServices/userService";
import { UserEnum } from "../Enums/UserEnum";
import { OrderService } from "../services/botServices/orderService";
export type SawingOrder = UserOrder;
export type DoorOrder = UserOrder;
export type TFullOrder = {
  userSawingOrder: SawingOrder;
  userDoorOrder: DoorOrder;
};
export class OrdersWather {
  private usersWatchers: TUser[] = [];
  private bot;
  private fullOrders: TFullOrder[] = [];
  private userService;
  private orderService;

  constructor(usersId: string[], bot: Telegraf<Context<Update>>) {
    this.bot = bot;
    this.userService = new UserService();
    this.orderService = new OrderService();
    this.init(usersId);
  }

  async init(usersId: string[]) {
    for (const userId of usersId) {
      const userDocument = await this.userService.getUserInfo(userId);
      console.log(userDocument);
      this.usersWatchers.push(userDocument!.toObject());
    }
  }
  async updateState(
    ctx: NarrowedContext<
      Context<Update>,
      Update.CallbackQueryUpdate<CallbackQuery>
    >
  ) {
    const { from } = ctx.update.callback_query;
    if (from.id === 1025570209){
        
    }
    const message_id = ctx.update.callback_query.message!.message_id;
    const state = ctx.update.callback_query.data;
    const order = await this.orderService.getOrderByOrderId(message_id);
    if (!order) {
      return;
    }

    if (state === "accepted") {
      if (!order.accepted) {
        order.accepted = true;
      } else {
        ctx.answerCbQuery();
      }
    } else if (state === "ready") {
      if (order.accepted && !order.ready) {
        order.ready = true;
      } else {
        ctx.answerCbQuery();
      }
    } else {
      ctx.answerCbQuery();
    }

    for (const userWatcher of this.usersWatchers) {
      const messageText = `${
        order!.closetName
      } \n Распил \n ❎ \n ❎ \n Двери \n ❎ \n ❎`;
      const message = await this.bot.telegram.sendMessage(
        userWatcher.id,
        messageText
      );
    }
    ctx.update.callback_query.data;
    // if (userOrder.state.acceptedActive){
    //     await this.bot.telegram.sendMessage(this.user.id, `${userOrder.order.closetName} \n Распил \n ✅ \n ✅`);
    // }
  }

  async addFullOrder(
    order: Omit<TOrder, "firstName" | "lastName" | "id" | "accepted" | "ready">
  ) {
    const userSawingDocument = await this.userService.getUserInfo("1025570209");
    const userSawingOrder = new UserOrder(
      order,
      userSawingDocument!.toObject(),
      this.bot
    );

    const userDoorDocument = await this.userService.getUserInfo("795779725");
    const userDoorOrder = new UserOrder(
      order,
      userDoorDocument!.toObject(),
      this.bot
    );

    const fullOrder = {
      userSawingOrder,
      userDoorOrder,
    };

    this.fullOrders.push(fullOrder);
    const messageText = `${order.closetName} \n Распил \n ❎ \n ❎ \n Двери \n ❎ \n ❎`;
    for (const userWatcher of this.usersWatchers) {
      const message = await this.bot.telegram.sendMessage(
        userWatcher.id,
        messageText
      );
    }
  }
}
