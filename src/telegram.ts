import { Telegraf } from "telegraf";
import { UserService } from "./services/botServices/user.service";
import { OrderDTO } from "./types/orderType";
import { TUser } from "./types/userType";
import { TelegramService } from "./services/botServices/telegram.service";


export class TelegramBot {
  readonly bot;
  private readonly userService;
  private readonly telegramService;

  constructor(telegram_token: string) {
    this.bot = new Telegraf(telegram_token);
    this.bot.launch();

    this.userService = new UserService();
    this.telegramService = new TelegramService(this.bot);

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
      await this.telegramService.updateState(ctx);
    });
  }

  async createOrders(orders: OrderDTO[]) {
    try {
      for (const order of orders){
        await this.telegramService.createOrder(order);
      }
      
    } catch (e) {
      console.log(e);
    }
  }
}
