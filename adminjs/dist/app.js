import AdminJS from "adminjs";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { DatabaseURI } from "./database.js";
import AdminJSExpress from "@adminjs/express";
import express from "express";
import mongoose from 'mongoose';
import * as url from 'url';
import path from 'path';
import { componentLoader } from "./admin/components/component-loader.js";
import UserModel from "./admin/entities/user.entity.js";
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
console.log(__dirname);
const PORT = 3000;
AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
});
const start = async () => {
    await mongoose.connect(DatabaseURI);
    const adminJs = new AdminJS({
        resources: [
            UserModel
        ],
        componentLoader,
    });
    const app = express();
    const adminRouter = AdminJSExpress.buildRouter(adminJs);
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(adminJs.options.rootPath, adminRouter);
    app.listen(PORT, () => {
        console.log(`AdminJS started on http://localhost:${PORT}${adminJs.options.rootPath}`);
    });
};
start();
