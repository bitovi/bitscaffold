// Library Functions
import Koa, { Middleware } from "koa";

import KoaRouter from "@koa/router";
import KoaMount from "koa-mount";
import { Sequelize } from "sequelize";

import { ScaffoldModel, ScaffoldOptions } from "./types";
import { convertScaffoldModels } from "./sequelize";
import {
  attachCustom,
  attachDelete,
  attachGetOne,
  attachPost,
  attachPut,
  prepareDefaultRoutes,
} from "./routes";
import { prepareKoaInstance, prepareSequelizeInstance } from "./libs";

export class Scaffold<T extends ScaffoldModel> {
  private finalized: boolean;
  private _models: T[];
  private sequelize: Sequelize;
  private prefix: string;
  private koa: Koa;
  private router: KoaRouter;

  constructor(models: T[], options: ScaffoldOptions) {
    this._models = models;
    this.koa = prepareKoaInstance();
    this.sequelize = prepareSequelizeInstance();
    this.router = new KoaRouter();
    this.prefix = options.prefix || "/";

    convertScaffoldModels<T>(this.sequelize, this._models);

    this.koa.use(async (ctx, next) => {
      ctx.state.database = this.sequelize;
      ctx.state.models = this.sequelize.models;
      ctx.state.validation = {};
      await next();
    });

    this.finalized = false;

    if (options.sync) {
      this.createDatabase();
    }
  }

  public get custom() {
    if (this.finalized) {
      throw new Error("Already Finalized!");
    }
    return {
      findAll: function attachGetAll(Model: T, middlewares: Middleware[]) {
        console.log(Model, middlewares);
      },
      findOne: attachGetOne.bind(this),
      post: attachPost.bind(this),
      put: attachPut.bind(this),
      delete: attachDelete.bind(this),
      route: attachCustom.bind(this),
    };
  }

  /**
   * The `defaults` Middleware provides the primary hooks
   * between your Koa application and the Scaffold library
   * @returns 
   */
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

  // This should mostly be used for testing. It will Sync
  // all of the known Sequelize models against the sequelize
  // instance. This is a destructive operation on a real database.
  async createDatabase(): Promise<Sequelize> {
    return this.sequelize.sync({ force: true });
  }

  models(sm: T) {

    if (!sm) {
      throw new Error("No Model Specified");
    }

    if (!sm.name) {
      throw new Error("No Model Name Specified");
    }

    if (!this.sequelize.models[sm.name]) {
      throw new Error("Unknown Model Requested");
    }

    const test = this.sequelize.models[sm.name]
    return test;
  }
}

