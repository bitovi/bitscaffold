import os from "node:os";

import { Options, Sequelize } from "sequelize";
import Koa from "koa";
import signale from "signale";
import KoaBodyParser, { HttpMethodEnum } from "koa-body";
import {
  scaffoldErrorHandlerMiddleware,
  scaffoldLoggingMiddleware,
} from "../middleware";

export function prepareKoaInstance(): Koa {
  const koa = new Koa();

  koa.use(
    KoaBodyParser({
      parsedMethods: [
        HttpMethodEnum.POST,
        HttpMethodEnum.PUT,
        HttpMethodEnum.PATCH,
        HttpMethodEnum.DELETE,
      ],
      multipart: true,
      includeUnparsed: true,
      formidable: { multiples: true, uploadDir: os.tmpdir() },
    })
  );

  koa.use(scaffoldErrorHandlerMiddleware());
  koa.use(scaffoldLoggingMiddleware());
  return koa;
}

export function prepareSequelizeInstance(options?: Options): Sequelize {
  if (!options) {
    signale.info("Using in-memory database, no persistance configured");
    return new Sequelize('sqlite::memory:', {
      logging: (message) => {
        signale.info(" DB: ", message)
      }
    });
  }

  signale.info("Creating Sequelize instance with options:", options);
  const sequelize = new Sequelize(options);
  return sequelize;
}
