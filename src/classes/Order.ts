import { CallbackQuery, InlineKeyboardButton, Update } from "telegraf/typings/core/types/typegram";
import { TOrder } from "../types/orderType";
import { Context, NarrowedContext, Telegraf } from "telegraf";
import { TUser } from "../types/userType";
import fs from "fs";
import { OrderService } from "../services/botServices/orderService";
export type TState = {
    acceptedActive: boolean,
    readyActive: boolean,
}

export class UserOrder {
    private user;
    private bot;
    public state: TState = {
        acceptedActive: false,
        readyActive: false,
    }
    public order;
    private readonly orderService;
    constructor(order: Omit<TOrder, "firstName" | "lastName" | "id" | "accepted" | "ready">, user: TUser, bot: Telegraf<Context<Update>>) {
      this.user = user;
      this.order = order;
      this.bot = bot;
      this.orderService = new OrderService();
      this.createOrder();
    }
  
    async createOrder(){
      const {
        orderNum,
        closetName,
        comment,
        file1Path,
        file1Name,
        file2Path,
        file2Name,
        dateCreated,
      } = this.order;
  
      const file1Data = fs.createReadStream(file1Path);
  
      const file2Data = fs.createReadStream(file2Path);
      try {
        const buttons: InlineKeyboardButton[] = [
          { text: "Принял", callback_data: "accepted"},
          { text: "Готов", callback_data: "ready" },
        ];
        const keyboard: InlineKeyboardButton[][] = [[...buttons]];
        // Отправить два файла в одном сообщении с общим комментарием и кнопками
        await this.bot.telegram.sendMediaGroup(this.user.id, [
          {
            media: { source: file1Data, filename: file1Name },
            type: "document",
          },
          {
            media: { source: file2Data, filename: file2Name },
            type: "document",
          },
        ]);
        const message = await this.bot.telegram.sendMessage(this.user.id, closetName, {
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });

        const newOrder: TOrder = {
            orderNum,
            closetName,
            comment,
            file1Path,
            file1Name,
            file2Path,
            file2Name,
            dateCreated,
            accepted: false,
            ready: false,
            id: message.chat.id,
            orderId: message.message_id,
            firstName: message.from!.first_name,
            lastName: message.from!.last_name!,
        }
        console.log(await this.orderService.createOrder(newOrder));
      } catch (e) {
        console.log(e);
      }
    }

    async setState(ctx: NarrowedContext<Context<Update>, Update.CallbackQueryUpdate<CallbackQuery>>){
        const state = ctx.update.callback_query.data;
        console.log(state);
        if (state === "accepted") {
            if (!this.state.acceptedActive) {
              ctx.answerCbQuery("Вы приняли заказ!");
              this.state.acceptedActive = true;
              const updatedButtons: InlineKeyboardButton[] = [
                {
                  text: "✅ Принял",
                  callback_data: "accepted",
                },
                { text: "Готов", callback_data: "ready" },
              ];
              ctx.editMessageReplyMarkup({
                inline_keyboard: [updatedButtons],
              });
            } else {
              ctx.answerCbQuery();
            }
            // Ваш код для обработки нажатия на Кнопку 1
          } else if (state === "ready") {
            if (this.state.acceptedActive && !this.state.readyActive) {
              this.state.readyActive = true;
              ctx.answerCbQuery("Вы завершили заказ!");
              const updatedButtons: InlineKeyboardButton[] = [
                {
                  text: "✅ Принял",
                  callback_data: "accepted",
                },
                { text: "✅ Готов", callback_data: "ready" },
              ];
              ctx.editMessageReplyMarkup({
                inline_keyboard: [updatedButtons],
              });
            } else if (!this.state.acceptedActive) {
              ctx.answerCbQuery("Вы еще не приняли заказ!");
            } else {
              ctx.answerCbQuery();
            }
          }
    }
  }