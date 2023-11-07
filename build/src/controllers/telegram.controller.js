"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Middleware для проверки аутентификации
class TelegramController {
    constructor(telegramService) {
        this.telegramService = telegramService;
    }
    async createOrder(req, res) {
        const orders = req.body;
        try {
            for (const order of orders) {
                await this.telegramService.createOrder(order);
            }
            res.status(200).json({ success: true, message: 'Orders created successfully' });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ success: false, message: 'Error creating orders', error: e });
        }
    }
}
exports.default = TelegramController;
