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

router.get("/", (req, res) => {
  let previewImage = "";
  const additionalImages: string[] = [];
  const { size, color } = req.query;
  console.log('1')
  if (size && typeof size === 'string' && color) {
    const imagesDirectory = path.resolve(
      __dirname,
      `../../static_files/photos/${imageDir[size]}/${color}`
    );

    fs.readdir(imagesDirectory, (err, files) => {
      if (err) {
        console.error("Ошибка чтения директории:", err);
        res.status(500).json({ error: "Ошибка чтения директории" });
        return;
      }

      files.forEach((file) => {
        if (file === 'preview.jpg') {
          previewImage = `/images/${imageDir[size]}/${color}/${file}`;
        } else {
          additionalImages.push(`/images/${imageDir[size]}/${color}/${file}`);
        }
      });

      // Отправьте список файлов обратно на фронтенд
      console.log({ additional: additionalImages, preview: previewImage })
      res.json({ additional: additionalImages, preview: previewImage });
    });
  }
});

export default router;