import { Telegraf } from "telegraf";

import { UserService } from "./services/botServices/userService";

import { TOrder } from "./types/orderType";

import { UserOrder } from "./classes/Order";
import { TUser } from "./types/userType";
import { OrdersWather } from "./classes/OrdersWatcher";

export class TelegramBot {
  readonly bot;
  private readonly orderWatcher;
  private readonly userService;
  private readonly usersWatchersId = ["6637928149"];
  constructor(telegram_token: string) {
    this.userService = new UserService();
    this.bot = new Telegraf(telegram_token);
    this.orderWatcher = new OrdersWather(this.usersWatchersId, this.bot);
    this.init();
    this.bot.launch();
  }
  async init() {
    this.bot.start((ctx) => {
      const userSender: TUser = ctx.update.message.from;
      this.userService.createUser(userSender);
      ctx.reply("Привет!");
    });

    this.bot.on("callback_query", (ctx) => {
      this.orderWatcher.updateState(ctx);
      console.log(ctx.update.callback_query);
    });
  }

  async createOrders(order: Omit<TOrder, "firstName" | "lastName" | "id" | "accepted" | "ready"> ) {
    try {
      this.orderWatcher.addFullOrder(order);
    } catch (e) {
      console.log(e);
    }
  }
}
