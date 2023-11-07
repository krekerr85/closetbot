import express from "express";
import passport from "passport";
import { connectDB } from "./src/mongo/db";
import setupTelegramRoutes from "./src/routes/telegram.router";
import imagesRoutes from "./src/routes/images.router";
import cors from "cors";
import path from "path";
import { TelegramService } from "./src/services/botServices/telegram.service";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

const imagesDirectory = path.join(__dirname, `./static_files/photos/`);

dotenv.config({
  path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`),
});

const app = express();
connectDB();

app.use(cors());
app.use(express.static(path.join(process.cwd(), "./client_react/build")));
console.log(path.join(process.cwd(), "./client_react/build"))
app.use(express.json());
app.use(passport.initialize());

app.use("/images", express.static(imagesDirectory));
app.use("/api/images", imagesRoutes);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN!);
bot.launch();
const telegramService = new TelegramService(bot);

app.use("/api/telegram", setupTelegramRoutes(telegramService));

async function init() {

  app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port", process.env.PORT || 3000);
  });
}

init();

// TODO 1) Сконфигурировать adminjs 2) Насроить докерфайл и скрипт для запуска контейнера в package.json 3) Рефакторинг фронта (добавить роутер в главный компонент, разбить основной компонент на несколько, добавить компоненты с авторизацией и регистрацией, исправить файл со стилями)
