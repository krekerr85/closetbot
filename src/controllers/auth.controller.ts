import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import WebUserModel, { WebUser } from '../mongo/schemas/webUser.model';
import LocalStrategy from 'passport-local';
import jwt from 'jsonwebtoken';
const router = express.Router();

passport.use(new LocalStrategy.Strategy(async (username, password, done) => {
    try {
        const user = await WebUserModel.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return done(null, false, { message: 'Неправильное имя пользователя или пароль.' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    const user = req.user as WebUser;
    const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '1h' });
    res.json({ token });
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await WebUserModel.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким именем уже существует.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new WebUserModel({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Пользователь успешно зарегистрирован.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка регистрации пользователя.' });
    }
});

export default router;