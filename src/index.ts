import bodyParser from "body-parser";
import "dotenv/config";
import express from "express";
import { TelegramBot } from "./telegram";
import { TOrder, TOrderDTO } from "./types/orderType";
import mongoose from "mongoose";


const app = express();
app.use(bodyParser.json());

async function init() {
  await mongoose.connect(process.env.MONGO_DB!);
  const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN!);

  // app.use(
  //   await telegramBot.bot.createWebhook({
  //     domain: "https://bd69-109-195-147-205.ngrok.io",
  //   })
  // );
  // app.use((req, res, next) => {
  //   res.status(404).json({ error: "Not Found" });
  // });
  
  // // Middleware для обработки ошибок 500
  // app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  //   res.status(500).json({ error: "Internal Server Error" });
  // });

  app.post("/create-order", async (req, res) => {
    const {
      order_num,
      closet_name,
      comment,
      file1Path,
      file1Name,
      file2Path,
      file2Name,
    } = req.body;
    const order: 
    TOrderDTO = {
      order_num,
      closet_name,
      comment,
      file1Path,
      file1Name,
      file2Path,
      file2Name,
      date_created: new Date(),
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
