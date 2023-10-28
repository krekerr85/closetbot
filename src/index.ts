import bodyParser from "body-parser";
import "dotenv/config";
import express from "express";
import { TelegramBot } from "./telegram";
import {OrderDTO } from "./types/orderType";
import passport from 'passport';
import {connectDB} from './mongo/db';
import authRoutes from './controllers/auth.controller';
import orderApiRoutes from './controllers/order.controller';

const app = express();
connectDB();
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);

app.use('/api/auth', orderApiRoutes);
app.use(bodyParser.json());

async function init() {
  
  const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN!);


  app.post("/create-order", async (req, res) => {

    const orders: OrderDTO[] = req.body; 


    try {
      await telegramBot.createOrders(orders);
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
