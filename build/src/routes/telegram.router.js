"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const telegram_controller_1 = __importDefault(require("../controllers/telegram.controller"));
const router = express_1.default.Router();
function setupTelegramRoutes(telegramService) {
    const telegramController = new telegram_controller_1.default(telegramService);
    router.post("/create-order", telegramController.createOrder.bind(telegramController));
    return router;
}
exports.default = setupTelegramRoutes;
