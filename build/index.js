"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const db_1 = require("./src/mongo/db");
const telegram_router_1 = __importDefault(require("./src/routes/telegram.router"));
const images_router_1 = __importDefault(require("./src/routes/images.router"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const telegram_service_1 = require("./src/services/botServices/telegram.service");
const telegraf_1 = require("telegraf");
const dotenv_1 = __importDefault(require("dotenv"));
const imagesDirectory = path_1.default.join(__dirname, `../static_files/photos/`);
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, `.env.${process.env.NODE_ENV}`),
});
const app = (0, express_1.default)();
(0, db_1.connectDB)();
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(process.cwd(), "./client_react/build")));
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
app.use("/images", express_1.default.static(imagesDirectory));
app.use("/api/images", images_router_1.default);
const bot = new telegraf_1.Telegraf(process.env.TELEGRAM_TOKEN);
bot.launch();
const telegramService = new telegram_service_1.TelegramService(bot);
app.use("/api/telegram", (0, telegram_router_1.default)(telegramService));
async function init() {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Listening on port", process.env.PORT || 3000);
    });
}
init();
// TODO 1) Сконфигурировать adminjs 2) Насроить докерфайл и скрипт для запуска контейнера в package.json 3) Рефакторинг фронта (добавить роутер в главный компонент, разбить основной компонент на несколько, добавить компоненты с авторизацией и регистрацией, исправить файл со стилями)
