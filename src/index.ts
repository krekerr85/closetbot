import bodyParser from "body-parser";
import "dotenv/config";
import axios from "axios";
import express from "express";
import { TelegramBot } from "./telegram";
import { TOrder } from "./types/orderType";
import mongoose from "mongoose";

const dbUsername = "artandsky";
const dbPassword = "1525402hj";
const dbName = "tg_botdb";

const app = express();
app.use(bodyParser.json());

async function init() {
  const db = await mongoose.connect(process.env.MONGO_DB!);
  const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN!);

  app.use(
    await telegramBot.bot.createWebhook({
      domain: "https://bd69-109-195-147-205.ngrok.io",
    })
  );

  app.post("/create-order", async (req, res) => {
    const {
      messageId,
      orderNum,
      closetName,
      comment,
      file1Path,
      file1Name,
      file2Path,
      file2Name,
    } = req.body;
    const order: Omit<
      TOrder,
      | "firstName"
      | "lastName"
      | "userId"
      | "accepted"
      | "ready"
      | "orderWatcherId"
    > = {
      messageId,
      orderNum,
      closetName,
      comment,
      file1Path,
      file1Name,
      file2Path,
      file2Name,
      dateCreated: new Date(),
    };

    try {
      await telegramBot.createOrders(order);
      res.status(200).json({ message: "Order created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.listen(process.env.PORT || 3000, () =>
    console.log("Listening on port", process.env.PORT || 3000)
  );
}

init();
