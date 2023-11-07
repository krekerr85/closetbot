"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const webUser_model_1 = __importDefault(require("../mongo/schemas/webUser.model"));
const passport_local_1 = __importDefault(require("passport-local"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
passport_1.default.use(new passport_local_1.default.Strategy(async (username, password, done) => {
    try {
        const user = await webUser_model_1.default.findOne({ username });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            return done(null, false, { message: 'Неправильное имя пользователя или пароль.' });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
router.post('/login', passport_1.default.authenticate('local', { session: false }), (req, res) => {
    const user = req.user;
    const token = jsonwebtoken_1.default.sign({ id: user._id }, 'your-secret-key', { expiresIn: '1h' });
    res.json({ token });
});
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await webUser_model_1.default.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким именем уже существует.' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = new webUser_model_1.default({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка регистрации пользователя.' });
    }
});
exports.default = router;
