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

        let price110SM = row.get("Цена 110SM#");
        let priceU112 = row.get("Цена U112#");
        let price3025MX = row.get("Цена 3025MX#");
        let priceU164 = row.get("Цена U164#");

        let insert110SM = row.get("110SM#Вставка");
        let insertU112 = row.get("U112#Вставка");
        let insert3025MX = row.get("3025MX#Вставка");
        let insertU164 = row.get("U164#Вставка");

        let opening110SM = row.get("110SM#Проем");
        let openingU112 = row.get("U112#Проем");
        let opening3025MX = row.get("3025MX#Проем");
        let openingU164 = row.get("U164#Проем");



        let door_type = row.get("Двери");

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "110SM" },
          { price: priceColor110SM, additional_text: addTextColor110SM, insert: insert110SM, opening: opening110SM, priceLey: price110SM },
          { upsert: true, new: true }
        );

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "U112" },
          { price: priceColorU112, additional_text: addTextColorU112, insert: insertU112, opening: openingU112, priceLey: priceU112 },
          { upsert: true, new: true }
        );

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "3025MX" },
          { price: priceColor3025MX, additional_text: addTextColor3025MX, insert: insert3025MX, opening: opening3025MX, priceLey: price3025MX },
          { upsert: true, new: true }
        );

        await PriceModel.findOneAndUpdate(
          { width, door_type, color: "U164" },
          { price: priceColorU164, additional_text: addTextColorU164, insert: insertU164, opening: openingU164, priceLey: priceU164 },
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
  async getOrderNum() {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[2];
    await sheet.loadCells("I3");
    const orderNum = sheet.getCellByA1("I3").value;

    return orderNum ? Number(orderNum) + 1 : 1;
  }
  async getPriceLeyInfo(order: OrderDTO) {
    const { size, color, door_type } = order;
    const doc = await PriceModel.findOne({
      width: size,
      color,
      door_type: doorTypesGoogleSheet[door_type],
    });
    if (doc) {
      return doc.priceLey;
    }
  }
  async getPriceDoc(order: OrderDTO) {
    const { size, color, door_type } = order;
    const doc = await PriceModel.findOne({
      width: size,
      color,
      door_type: doorTypesGoogleSheet[door_type],
    });
    if (doc) {
      return doc
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
    const sheet = this.doc.sheetsByIndex[2];
    await sheet.loadCells("I1:I2");
    const hoursForProcessing = sheet.getCellByA1("I1");
    const daysForProduction = sheet.getCellByA1("I2");
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
