import os from "node:os";

import { Sequelize } from "sequelize";
import Koa from "koa";
import signale from "signale";
import KoaBodyParser from "koa-body";
import {
  scaffoldErrorHandlerMiddleware,
  scaffoldLoggingMiddleware,
} from "../middleware";

export function prepareKoaInstance(): Koa {
  const koa = new Koa();

  koa.use(
    KoaBodyParser({
      parsedMethods: ["POST", "PUT", "PATCH", "DELETE"],
      multipart: true,
      includeUnparsed: true,
      formidable: { multiples: true, uploadDir: os.tmpdir() },
    })
  );

  koa.use(scaffoldErrorHandlerMiddleware());
  koa.use(scaffoldLoggingMiddleware());
  return koa;
}

export function prepareSequelizeInstance(): Sequelize {
  signale.info("Creating Sequelize instance");
  const sequelize = new Sequelize("sqlite::memory:", {
    logging: (message) => {
      signale.info("  SQL:", message);
    },
  });
  return sequelize;
}
