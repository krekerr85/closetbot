import express from "express";
import TelegramController from "../controllers/telegram.controller";
import { TelegramService } from "../services/botServices/telegram.service";

const router = express.Router();

function setupTelegramRoutes(telegramService: TelegramService) {
  const telegramController = new TelegramController(telegramService);
  router.post("/create-order", telegramController.createOrder.bind(telegramController));
  return router;
}

export default setupTelegramRoutes;
