// Library Functions
import Koa from "koa";
import os from "node:os";
import http, { Server } from "node:http";
import { v4 } from "uuid";
import { Signale } from "signale";
import KoaRouter from "@koa/router";
import KoaMount from "koa-mount";
import { Middleware } from "koa";
import { Model, ModelStatic, Sequelize } from "sequelize";

import { ScaffoldModel } from "../types";
import { prepareModels, prepareSequelize } from "../sequelize";
import KoaBodyParser from "koa-body";
import { prepareDefaultRoutes } from "../routes";
import { ErrorHandler } from "..";

export class Scaffold {
  private isInitialized: () => Promise<void>;
  private models: ScaffoldModel[];
  private sequelize: Sequelize;
  private prefix: string;
  private koa: Koa;
  private router: KoaRouter;
  private _initialized: Promise<void>;

  constructor(models: ScaffoldModel[], options: any) {
    this.models = models;
    this.koa = new Koa();
    this.sequelize = prepareSequelize();
    this.router = prepareDefaultRoutes();
    this.prefix = options.prefix || "/";

    this._initialized = new Promise<void>((resolve) => {
      prepareModels(this.sequelize, this.models).then(() => {
        this.koa.use(
          KoaBodyParser({
            parsedMethods: ["POST", "PUT", "PATCH", "DELETE"],
            multipart: true,
            includeUnparsed: true,
            formidable: { multiples: true, uploadDir: os.tmpdir() },
          })
        );

        this.koa.use(ErrorHandler());

        // Attach some debugging uuid information to
        // state, logging, and response headers
        this.koa.use(async (ctx: Koa.Context, next: Koa.Next) => {
          ctx.state.uuid = v4();
          ctx.state.logger = new Signale({ scope: ctx.state.uuid });

          ctx.set("x-koa-uuid", ctx.state.uuid);
          await next();
        });

        this.koa.use(async (ctx, next) => {
          ctx.state.database = this.sequelize;
          ctx.state.models = this.sequelize.models;
          ctx.state.validation = {};
          await next();
        });

        this.koa.use(this.router.routes());
        this.koa.use(this.router.allowedMethods());
        resolve();
      });
    });

    this.isInitialized = () => this._initialized;
  }

  middleware(): Middleware {
    return KoaMount(this.prefix, this.koa);
  }

  async createServer(): Promise<Server> {
    await this.isInitialized();
    return http.createServer(this.koa.callback());
  }

  async isReady(): Promise<void> {
    await this.isInitialized();
  }

  resolveSequelizeModel(sm: ScaffoldModel): ModelStatic<Model> {
    if (!sm) {
      throw new Error("No Model Specified");
    }

    if (!sm.name) {
      throw new Error("No Model Name Specified");
    }

    if (!this.sequelize.models[sm.name]) {
      throw new Error("Unknown Model Requested");
    }

    return this.sequelize.models[sm.name];
  }
}
