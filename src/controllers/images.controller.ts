import express from "express";
import fs from "fs";
import path from "path";
interface ImageResponse {
    [key: string]: string;
}
const imageDir: ImageResponse = {
    '1800': "1,1-1,9",
    '1900': "1,1-1,9"
} 
const router = express.Router();

// Middleware для проверки аутентификации

// Защищенный эндпоинт
router.get("/get_images", (req, res) => {
  // req.user содержит информацию об аутентифицированном пользователе

  const { size, color }  = req.query;
  if (size && typeof size === 'string' && color) {
    const imagesDirectory = path.join(
      __dirname,
      `../../files/photos/${imageDir[size!.slice(5)]}/${color}`
    );
    fs.readdir(imagesDirectory, (err, files) => {
      if (err) {
        console.error("Ошибка чтения директории:", err);
        res.status(500).json({ error: "Ошибка чтения директории" });
        return;
      }
      console.log(files)
      // Отправьте список файлов обратно на фронтенд
      res.json({ images: files });
    });
  }
});

export default router;
