import express from "express";
import fs from "fs";
import path from "path";
interface ImageResponse {
    [key: string]: string;
}
const imageDir: ImageResponse = {
    '1100': "1.1-1.9",
    '1200': "1.1-1.9",
    '1300': "1.1-1.9",
    '1400': "1.1-1.9",
    '1500': "1.1-1.9",
    '1600': "1.1-1.9",
    '1700': "1.1-1.9",
    '1800': "1.1-1.9",
    '1900': "1.1-1.9",
    '2000': "2.0-2.2",
    '2100': "2.0-2.2",
    '2200': "2.0-2.2",
    '2300': "2.3-2.5",
    '2400': "2.3-2.5",
    '2500': "2.3-2.5",
    '2600': "2.6-2.7",
    '2700': "2.6-2.7",
    '2800': "2.8",
    '2900': "2.9-3.0",
    '3000': "2.9-3.0",
    '3100': "3.1-3.3",
    '3200': "3.1-3.3",
    '3300': "3.1-3.3",
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
      `../../static/photos/${imageDir[size!.slice(5)]}/${color}`
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
