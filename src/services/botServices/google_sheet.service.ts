import { GoogleSpreadsheet } from "google-spreadsheet";
import { PriceModel } from "../../mongo/schemas/price.model";
import { OrderDTO, OrderT } from "../../types/orderType";
import { doorTypesGoogleSheet } from "../../types/doorType";
import { ParamsModel } from "../../mongo/schemas/params.model";
import { JWT } from "google-auth-library";
import creds from "../../config/corded-cable-343416-9fb71f0a2562.json"; // the file saved above
import { getFormattedDate } from "../../utils/functions";
import { doorTypes } from "../../types/doorType";
export class GoogleSheetService {
  private readonly doc;
  private readonly SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ];

  private readonly jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: this.SCOPES,
  });
  constructor() {
    this.doc = new GoogleSpreadsheet(
      "1ae130cnQK5EuFvrTbxnsBg54eIb2cqcsdjz6PU0POao",
      this.jwt
    );
  }
  async init() {
    this.loadPrices();
    this.loadParams();
  }
  async loadPrices() {
    try {
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByIndex[0];
      const rows = await sheet.getRows();

      let prevWidth = null;
      for (const row of rows) {
        if (!row.rowNumber) {
          break;
        }
        let width = row.get("Ширина");
        if (width) {
          prevWidth = width;
        } else {
          width = prevWidth;
        }

        let priceColor110SMrice = row.get("110SM");
        let priceColorU112 = row.get("U112");
        let priceColor3025MX = row.get("3025MX");
        let priceColorU164 = row.get("U164");
        let door_type = row.get("Варианты дверей");

        // Проверяем, существует ли запись с указанными параметрами
        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "110SM" },
          { price: priceColor110SMrice },
          { upsert: true, new: true }
        );

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "U112" },
          { price: priceColorU112 },
          { upsert: true, new: true }
        );

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "3025MX" },
          { price: priceColor3025MX },
          { upsert: true, new: true }
        );

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "U164" },
          { price: priceColorU164 },
          { upsert: true, new: true }
        );
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getPriceInfo(order: OrderDTO) {
    const { size, color, door_type } = order;
    const doc = await PriceModel.findOne({
      width: size,
      color,
      door_type: doorTypesGoogleSheet[door_type],
    });
    if (doc) {
      return doc.price;
    }
  }
  async loadParams() {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[0];
    await sheet.loadCells("J4:J5");
    const hoursForProcessing = sheet.getCellByA1("J4"); // or A1 style notation
    const daysForProduction = sheet.getCellByA1("J5"); // or A1 style notation
    await ParamsModel.findOneAndUpdate(
      {},
      {
        hoursForProcessing: Number(hoursForProcessing.value),
        daysForProduction: Number(daysForProduction.value),
      },
      { upsert: true, new: true }
    );
  }

  async writeData(order: OrderT) {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[1]; // Индекс или название листа, куда вы хотите записать данные
    const price = await this.getPriceInfo(order.order);
    if (!price) {
      console.log("Цена не задана!");
      return;
    }
    // Данные для записи
    const rowData = [
      order.order_num,
      order.order.size,
      order.order.color,
      doorTypes[order.order.door_type],
      order.order.comment,
      getFormattedDate(order.date_created),
      price,
      // Другие колонки и значения
    ];

    // Добавление новой строки в конец таблицы
    await sheet.addRow(rowData);
    console.log("Новая строка успешно добавлена в таблицу.");
  }
}
