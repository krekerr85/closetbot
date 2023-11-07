"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const BASE_URL = "http://localhost:3001";
const imageDir = {
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
};
const router = express_1.default.Router();
router.get("/", (req, res) => {
    let previewImage = "";
    const additionalImages = [];
    const { size, color } = req.query;
    if (size && typeof size === 'string' && color) {
        const imagesDirectory = path_1.default.resolve(__dirname, `../../static_files/photos/${imageDir[size]}/${color}`);
        fs_1.default.readdir(imagesDirectory, (err, files) => {
            if (err) {
                console.error("Ошибка чтения директории:", err);
                res.status(500).json({ error: "Ошибка чтения директории" });
                return;
            }
            files.forEach((file) => {
                if (file === 'preview.jpg') {
                    previewImage = `${BASE_URL}/images/${imageDir[size]}/${color}/${file}`;
                }
                else {
                    additionalImages.push(`${BASE_URL}/images/${imageDir[size]}/${color}/${file}`);
                }
            });
            // Отправьте список файлов обратно на фронтенд
            res.json({ additional: additionalImages, preview: previewImage });
        });
    }
});
exports.default = router;
