

import express from "express";
import passport from "passport";
import { connectDB } from "./mongo/db";
import setupTelegramRoutes from "./routes/telegram.router";
import imagesRoutes from "./routes/images.router";
import cors from "cors";
import path from "path";
import { TelegramService } from "./services/botServices/telegram.service";
import { Telegraf } from "telegraf";
import dotenv from 'dotenv'

const imagesDirectory = path.join(__dirname, `../static/photos/`);

dotenv.config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`)
});

const app = express();
connectDB();

app.use(cors());
app.use(express.static(path.join(process.cwd(), "./client_react/build")));
app.use(express.json());
app.use(passport.initialize());

app.use("/images", express.static(imagesDirectory));
app.use("/api/images", imagesRoutes);


const bot = new Telegraf(process.env.TELEGRAM_TOKEN!);
bot.launch();
const telegramService = new TelegramService(bot);


app.use("/api/telegram", setupTelegramRoutes(telegramService));


async function init() {

  

  app.listen(process.env.PORT || 3000, () =>
    console.log("Listening on port", process.env.PORT || 3000)
  );
}

init();
