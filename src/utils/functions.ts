export function getFormattedDate(date: Date | undefined) {
  if (!date) {
    date = new Date();
  }

  const year = date.getFullYear().toString().slice(-2); // Получаем последние две цифры года
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Получаем месяц (с нулем впереди, если месяц < 10)
  const day = ("0" + date.getDate()).slice(-2); // Получаем день (с нулем впереди, если день < 10)
  return `${day}.${month}.${year}`;
}

export function markdownV2Format(str: string) {
    const formattedStr = str
    .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    console.log(formattedStr);
    return formattedStr;
}
