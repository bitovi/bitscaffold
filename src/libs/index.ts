// Library Functions
import Koa from "koa";
import os from "node:os";
import http, { Server } from "node:http";
import { v4 } from "uuid";
import signale, { Signale } from "signale";
import KoaRouter from "@koa/router";
import KoaMount from "koa-mount";
import { Middleware } from "koa";
import { Model, ModelStatic, Sequelize } from "sequelize";

import { ScaffoldModel } from "../types";
import { prepareModels, prepareSequelize } from "../sequelize";
import KoaBodyParser from "koa-body";
import { prepareDefaultRoutes } from "../routes";
import { ErrorHandler } from "..";
import compose from "koa-compose";

export class Scaffold {
  private isInitialized: () => Promise<void>;
  private finalized: boolean;
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
    this.router = new KoaRouter();
    this.prefix = options.prefix || "/";

    this._initialized = new Promise<void>((resolve) => {
      prepareModels(this.sequelize, this.models).then(() => {
        resolve();
      });
    });

    this.koa.use(async (ctx, next) => {
      signale.info("Scaffold Request: ", ctx.method, ctx.path);
      await next();
    });

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

    this.isInitialized = () => this._initialized;
    this.finalized = false;
  }

  public get custom() {
    if (this.finalized) {
      throw new Error("Already Finalized!");
    }
    return {
      findAll: (Model: ScaffoldModel, middlewares: Middleware[]): void => {
        signale.pending("Custom findAll: ", Model.name);
        this.router.get("/" + Model.name + "", compose(middlewares));
        signale.success("Custom findAll: ", Model.name);
      },
      findOne: (Model: ScaffoldModel, middlewares: Middleware[]): void => {
        signale.pending("Custom findOne: ", Model.name);
        this.router.get("/" + Model.name + "/:id", compose(middlewares));
        signale.success("Custom findOne: ", Model.name);
      },
      post: (Model: ScaffoldModel, middlewares: Middleware[]): void => {
        signale.pending("Custom post: ", Model.name);
        this.router.post("/" + Model.name + "", compose(middlewares));
        signale.success("Custom post: ", Model.name);
      },
      put: (Model: ScaffoldModel, middlewares: Middleware[]): void => {
        signale.pending("Custom put: ", Model.name);
        this.router.put("/" + Model.name + "/:id", compose(middlewares));
        signale.success("Custom put: ", Model.name);
      },
      delete: (Model: ScaffoldModel, middlewares: Middleware[]): void => {
        signale.pending("Custom delete: ", Model.name);
        this.router.delete("/" + Model.name + "/:id", compose(middlewares));
        signale.success("Custom delete: ", Model.name);
      },
      route: (type: string, path: string, middleware: Middleware): void => {
        signale.pending("Custom route: ", type.toUpperCase(), path);
        this.router[type](path, middleware);
        signale.success("Custom route: ", type.toUpperCase(), path);
      },
    };
  }

  defaults(): Middleware {
    this.finalize();
    return KoaMount(this.prefix, this.koa);
  }

  finalize(): void {
    if (this.finalized) {
      throw new Error("Already Finalized!");
    }
    prepareDefaultRoutes(this.router);

    this.koa.use(this.router.routes());
    this.koa.use(this.router.allowedMethods());
    this.finalized = true;
  }

  // This should mostly be used for testing. It will return
  // a new http server wrapping the Koa apps that contain Scaffold
  async createServer(): Promise<Server> {
    await this.isInitialized();

    const app = new Koa();
    app.use(this.defaults());

    return http.createServer(app.callback());
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
