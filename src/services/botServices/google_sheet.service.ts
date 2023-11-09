import { GoogleSpreadsheet } from "google-spreadsheet";
import { PriceModel } from "../../mongo/schemas/price.model";
import { OrderDTO, OrderT } from "../../types/orderType";
import { doorTypesGoogleSheet } from "../../types/doorType";
import { ParamsModel } from "../../mongo/schemas/params.model";
import { JWT } from "google-auth-library";
import creds from "../../configs/corded-cable-343416-9fb71f0a2562.json"; // the file saved above
import { getFormattedDate } from "../../utils/functions";
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
    this.init();
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

        let priceColor110SM = row.get("110SM");
        let priceColorU112 = row.get("U112");
        let priceColor3025MX = row.get("3025MX");
        let priceColorU164 = row.get("U164");

        let addTextColor110SM = row.get("110SM#");
        let addTextColorU112 = row.get("U112#");
        let addTextColor3025MX = row.get("3025MX#");
        let addTextColorU164 = row.get("U164#");

        let door_type = row.get("Варианты дверей");

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "110SM" },
          { price: priceColor110SM, additional_text: addTextColor110SM },
          { upsert: true, new: true }
        );

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "U112" },
          { price: priceColorU112, additional_text: addTextColorU112 },
          { upsert: true, new: true }
        );

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "3025MX" },
          { price: priceColor3025MX, additional_text: addTextColor3025MX },
          { upsert: true, new: true }
        );

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "U164" },
          { price: priceColorU164, additional_text: addTextColorU164 },
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

  async getAddTextInfo(order: OrderDTO) {
    const { size, color, door_type } = order;
    const doc = await PriceModel.findOne({
      width: size,
      color,
      door_type: doorTypesGoogleSheet[door_type],
    });
    if (doc) {
      return doc.additional_text;
    }
  }
  async deleteOrder(order_num: number) {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[1];
    const rows = await sheet.getRows();
    for (const row of rows) {
      if (Number(row.get("№")) === order_num) {
        row.set("Коментарий", "Заказ был удален оператором!");
        row.set("Цена", "");
        await row.save();
      }
    }

    // make updates

    // save changes
  }
  async loadParams() {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[0];
    await sheet.loadCells("L2:L3");
    const hoursForProcessing = sheet.getCellByA1("L2");
    const daysForProduction = sheet.getCellByA1("L3");
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
    const sheet = this.doc.sheetsByIndex[1];
    const price = await this.getPriceInfo(order.order);
    if (!price) {
      console.log("Цена не задана!");
      return;
    }

    const rowData = [
      order.order_num,
      order.order.size,
      order.order.color,
      order.order.door_type,
      order.order.comment,
      getFormattedDate(order.date_created),
      price,
    ];

    // Добавление новой строки в конец таблицы
    await sheet.addRow(rowData);
    console.log("Новая строка успешно добавлена в таблицу.");
  }
}
