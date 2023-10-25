import { Telegraf } from "telegraf";
import { UserService } from "./services/botServices/user.service";
import { TOrderDTO } from "./types/orderType";
import { TUser } from "./types/userType";
import { OrderWatcherService } from "./services/botServices/orderWatcher.service";

export class TelegramBot {
  readonly bot;
  private readonly userService;
  private readonly orderWatcherService;

  constructor(telegram_token: string) {
    this.bot = new Telegraf(telegram_token);
    this.bot.launch();

    this.userService = new UserService();
    this.orderWatcherService = new OrderWatcherService(this.bot);

    this.init();
  }

  async init() {
    this.bot.start((ctx) => {
      const userSender: TUser = {
        user_id: ctx.update.message.from.id,
        first_name: ctx.update.message.from.first_name,
      };
      this.userService.createUser(userSender);
      ctx.reply("Привет!");
    });

    this.bot.on("callback_query", async (ctx) => {
      await this.orderWatcherService.updateState(ctx);
    });
  }

  async createOrders(order: TOrderDTO) {
    try {
      this.orderWatcherService.createOrder(order);
    } catch (e) {
      console.log(e);
    }
  }
}
