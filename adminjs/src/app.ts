import AdminJS from "adminjs";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { connect, DatabaseURI } from "./database.js";
import AdminJSExpress from "@adminjs/express";
import express from "express";
import { PhotoResource } from "./admin/resources/photo.resource.js";
import * as url from 'url'
import path from 'path';
import { componentLoader } from "./admin/components/component-loader.js";
// other imports

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

console.log(__dirname)
const PORT = 3000;

AdminJS.registerAdapter(AdminJSMongoose);

const start = async () => {
  const mongooseDb = await connect(DatabaseURI, { useNewUrlParser: true });

  const adminJs = new AdminJS({
    databases: [mongooseDb],
    resources: [PhotoResource],
    componentLoader,
  });

  const app = express();


  const adminRouter = AdminJSExpress.buildRouter(adminJs);
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(adminJs.options.rootPath, adminRouter);

  app.listen(PORT, () => {
    console.log(
      `AdminJS started on http://localhost:${PORT}${adminJs.options.rootPath}`
    );
  });
};

start();
