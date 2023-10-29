import express from 'express';

const router = express.Router();

// Middleware для проверки аутентификации

// Защищенный эндпоинт
router.post('/create', (req, res) => {
    // req.user содержит информацию об аутентифицированном пользователе
    console.log(req.body)
    
    res.json({ express: 'daun'  });
    
});

export default router;