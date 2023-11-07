"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetService = void 0;
const google_spreadsheet_1 = require("google-spreadsheet");
const price_model_1 = require("../../mongo/schemas/price.model");
const doorType_1 = require("../../types/doorType");
const params_model_1 = require("../../mongo/schemas/params.model");
const google_auth_library_1 = require("google-auth-library");
const corded_cable_343416_9fb71f0a2562_json_1 = __importDefault(require("../../config/corded-cable-343416-9fb71f0a2562.json")); // the file saved above
const functions_1 = require("../../utils/functions");
class GoogleSheetService {
    constructor() {
        this.SCOPES = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
        ];
        this.jwt = new google_auth_library_1.JWT({
            email: corded_cable_343416_9fb71f0a2562_json_1.default.client_email,
            key: corded_cable_343416_9fb71f0a2562_json_1.default.private_key,
            scopes: this.SCOPES,
        });
        this.doc = new google_spreadsheet_1.GoogleSpreadsheet("1ae130cnQK5EuFvrTbxnsBg54eIb2cqcsdjz6PU0POao", this.jwt);
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
                }
                else {
                    width = prevWidth;
                }
                let priceColor110SMrice = row.get("110SM");
                let priceColorU112 = row.get("U112");
                let priceColor3025MX = row.get("3025MX");
                let priceColorU164 = row.get("U164");
                let door_type = row.get("Варианты дверей");
                await price_model_1.PriceModel.findOneAndUpdate({ width, door_type, color: "110SM" }, { price: priceColor110SMrice }, { upsert: true, new: true });
                await price_model_1.PriceModel.findOneAndUpdate({ width, door_type, color: "U112" }, { price: priceColorU112 }, { upsert: true, new: true });
                await price_model_1.PriceModel.findOneAndUpdate({ width, door_type, color: "3025MX" }, { price: priceColor3025MX }, { upsert: true, new: true });
                await price_model_1.PriceModel.findOneAndUpdate({ width, door_type, color: "U164" }, { price: priceColorU164 }, { upsert: true, new: true });
            }
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    async getPriceInfo(order) {
        const { size, color, door_type } = order;
        const doc = await price_model_1.PriceModel.findOne({
            width: size,
            color,
            door_type: doorType_1.doorTypesGoogleSheet[door_type],
        });
        if (doc) {
            return doc.price;
        }
    }
    async loadParams() {
        await this.doc.loadInfo();
        const sheet = this.doc.sheetsByIndex[0];
        await sheet.loadCells("J4:J5");
        const hoursForProcessing = sheet.getCellByA1("J4");
        const daysForProduction = sheet.getCellByA1("J5");
        await params_model_1.ParamsModel.findOneAndUpdate({}, {
            hoursForProcessing: Number(hoursForProcessing.value),
            daysForProduction: Number(daysForProduction.value),
        }, { upsert: true, new: true });
    }
    async writeData(order) {
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
            (0, functions_1.getFormattedDate)(order.date_created),
            price,
        ];
        // Добавление новой строки в конец таблицы
        await sheet.addRow(rowData);
        console.log("Новая строка успешно добавлена в таблицу.");
    }
}
exports.GoogleSheetService = GoogleSheetService;
