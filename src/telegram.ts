import { Telegraf } from "telegraf";
import { UserService } from "./services/botServices/userService";
import { TOrder } from "./types/orderType";
import { TUser } from "./types/userType";
import { OrderWatcherService } from "./services/botServices/orderWatcher.service";

export class TelegramBot {
  readonly bot;
  private readonly userService;
  private readonly orderWatcherService;
  private readonly usersWatchersId = ["6637928149"];
  constructor(telegram_token: string) {
    this.userService = new UserService();
    this.bot = new Telegraf(telegram_token);
    this.orderWatcherService = new OrderWatcherService(this.bot);
    this.init();
    this.bot.launch();
  }
  async init() {
    this.bot.start((ctx) => {
      const userSender: TUser = {
        userId: ctx.update.message.from.id,
        is_bot: ctx.update.message.from.is_bot,
        first_name: ctx.update.message.from.first_name,
      };
      this.userService.createUser(userSender);
      ctx.reply("Привет!");
    });

    this.bot.on("callback_query", async (ctx) => {
      await this.orderWatcherService.updateState(ctx);
      console.log(ctx.update.callback_query);
    });
  }

  async createOrders(
    order: Omit<
      TOrder,
      | "firstName"
      | "lastName"
      | "userId"
      | "accepted"
      | "ready"
      | "orderWatcherId"
    >
  ) {
    try {
      this.orderWatcherService.createOrder(order);
    } catch (e) {
      console.log(e);
    }
  }
}
