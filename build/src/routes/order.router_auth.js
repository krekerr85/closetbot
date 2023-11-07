"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
// Middleware для проверки аутентификации
const isAuthenticated = (req, res, next) => {
    // passport.authenticate() добавляет объект пользователя в req.user, если пользователь аутентифицирован
    passport_1.default.authenticate('local', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Пользователь не аутентифицирован.' });
        }
        req.user = user; // Добавляем пользователя в объект запроса
        return next();
    })(req, res, next);
};
// Защищенный эндпоинт
router.get('/protected', isAuthenticated, (req, res) => {
    // req.user содержит информацию об аутентифицированном пользователе
    res.json({ message: 'Это защищенный маршрут.', user: req.user });
});
exports.default = router;
