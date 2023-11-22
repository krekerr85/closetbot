import express from "express";
import fs from "fs";
import path from "path";
import { sizeDir } from "../types/sizeType";


const router = express.Router();

router.get("/", (req, res) => {
  let previewImage = "";
  const additionalImages: string[] = [];
  const { size, color } = req.query;
  console.log('1')
  if (size && typeof size === 'string' && color) {
    const imagesDirectory = path.resolve(
      __dirname,
      `../../static_files/photos/${sizeDir[size]}/${color}`
    );

    fs.readdir(imagesDirectory, (err, files) => {
      if (err) {
        console.error("Ошибка чтения директории:", err);
        res.status(500).json({ error: "Ошибка чтения директории" });
        return;
      }

      files.forEach((file) => {
        if (file === 'preview.jpg') {
          previewImage = `/images/${sizeDir[size]}/${color}/${file}`;
        } else {
          additionalImages.push(`/images/${sizeDir[size]}/${color}/${file}`);
        }
      });

      // Отправьте список файлов обратно на фронтенд
      console.log({ additional: additionalImages, preview: previewImage })
      res.json({ additional: additionalImages, preview: previewImage });
    });
  }
});

export default router;