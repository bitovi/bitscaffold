// Library Functions
import Koa, { Middleware } from "koa";

import KoaRouter from "@koa/router";
import KoaMount from "koa-mount";
import { Model, ModelStatic, Sequelize } from "sequelize";

import { ScaffoldModel, ScaffoldOptions } from "./types";
import { convertScaffoldModels } from "./sequelize";
import {
  attachCustom,
  attachDelete,
  attachGetAll,
  attachGetOne,
  attachPost,
  attachPut,
  prepareDefaultRoutes,
} from "./routes";
import { prepareKoaInstance, prepareSequelizeInstance } from "./libs";

export class Scaffold {
  private finalized: boolean;
  private models: ScaffoldModel[];
  private sequelize: Sequelize;
  private prefix: string;
  private koa: Koa;
  private router: KoaRouter;

  constructor(models: ScaffoldModel[], options: ScaffoldOptions) {
    this.models = models;
    this.koa = prepareKoaInstance();
    this.sequelize = prepareSequelizeInstance();
    this.router = new KoaRouter();
    this.prefix = options.prefix || "/";

    convertScaffoldModels(this.sequelize, this.models);

    this.koa.use(async (ctx, next) => {
      ctx.state.database = this.sequelize;
      ctx.state.models = this.sequelize.models;
      ctx.state.validation = {};
      await next();
    });

    this.finalized = false;
  }

  public get custom() {
    if (this.finalized) {
      throw new Error("Already Finalized!");
    }
    return {
      findAll: attachGetAll.bind(this),
      findOne: attachGetOne.bind(this),
      post: attachPost.bind(this),
      put: attachPut.bind(this),
      delete: attachDelete.bind(this),
      route: attachCustom.bind(this),
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

  // This should mostly be used for testing. It will Sync
  // all of the known Sequelize models against the sequelize
  // instance. This is a destructive operation on a real database.
  async createDatabase(): Promise<Sequelize> {
    return this.sequelize.sync({ force: true });
  }

  model(sm: ScaffoldModel): ModelStatic<Model> {
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
