import { Context, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Update } from "telegraf/typings/core/types/typegram";

export type ctxT = NarrowedContext<
  Context<Update>,
  Update.CallbackQueryUpdate<CallbackQuery>
>;

export type botT = Telegraf<Context<Update>>;
