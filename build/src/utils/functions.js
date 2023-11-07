"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdownV2Format = exports.getFormattedDate = void 0;
function getFormattedDate(date) {
    if (!date) {
        date = new Date();
    }
    const year = date.getFullYear().toString().slice(-2); // Получаем последние две цифры года
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Получаем месяц (с нулем впереди, если месяц < 10)
    const day = ("0" + date.getDate()).slice(-2); // Получаем день (с нулем впереди, если день < 10)
    return `${day}.${month}.${year}`;
}
exports.getFormattedDate = getFormattedDate;
function markdownV2Format(str) {
    const formattedStr = str
        .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    console.log(formattedStr);
    return formattedStr;
}
exports.markdownV2Format = markdownV2Format;
