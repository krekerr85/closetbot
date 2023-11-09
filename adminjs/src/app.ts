import AdminJS from "adminjs";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { DatabaseURI } from "./database.js";
import * as AdminJSExpress from "@adminjs/express";
import express from "express";
import mongoose from "mongoose";
import UserModel from "./admin/entities/user.entity.js";
import OrderModel from "./admin/entities/order.entity.js";
//@ts-ignore
import MongoStore from "connect-mongo";

const DEFAULT_ADMIN = {
  email: "admin@example.com",
  password: "password",
};

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

const PORT = 3000;

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const start = async () => {
  const app = express();

  mongoose.connect(DatabaseURI, {});

  const sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: "session",
    stringify: false,
    autoRemove: "interval",
    autoRemoveInterval: 1,
  });
  const adminOptions = {
    resources: [UserModel, OrderModel],
    rootPath: "/admin",
  };
  const admin = new AdminJS(adminOptions);

  const adminRouter = AdminJSExpress.default.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "adminjs",
      cookiePassword: "sessionsecret",
    },
    null,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: "sessionsecret",
      cookie: {
        httpOnly: false, //process.env.NODE_ENV === 'production',
        secure: false, //process.env.NODE_ENV === 'production',
      },
      name: "adminjs",
    }
  );
  app.use(admin.options.rootPath, adminRouter);

  app.listen(PORT, () => {
    console.log(
      `AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`
    );
  });
};

start();
