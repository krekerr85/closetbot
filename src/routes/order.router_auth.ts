import express from 'express';
import passport from 'passport';

const router = express.Router();

// Middleware для проверки аутентификации
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // passport.authenticate() добавляет объект пользователя в req.user, если пользователь аутентифицирован
    passport.authenticate('local', { session: false }, (err: Error, user: unknown) => {
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

export default router;