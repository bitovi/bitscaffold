import { Context, Middleware, Next } from "koa";
import { Sequelize } from "sequelize";
import { match } from "path-to-regexp";
import bodyParser from "co-body";

import {
  ScaffoldModel,
  ScaffoldModelParser,
  ScaffoldModelSerialize,
  ScaffoldOptions,
  SequelizeModelsCollection,
} from "./types";
import { convertScaffoldModels, createSequelizeInstance } from "./sequelize";
import { buildParserForModels } from "./parse";
import { buildSerializerForModels } from "./serialize";

export class Scaffold {
  // private _scaffoldModels: ScaffoldModelCollection;
  private _sequelizeModels: SequelizeModelsCollection;
  private _sequelize: Sequelize;
  private _allowedMethods: ["GET", "POST", "PUT", "DELETE"];
  private _sequelizeModelNames: string[];
  private _scaffoldModelNames: string[];
  private _prefix: string;

  constructor(models: ScaffoldModel[], options: ScaffoldOptions = {}) {
    // Prepare all of the ORM and keep references to the different Models
    this._sequelize = createSequelizeInstance(options.database);

    // this._scaffoldModels = {};
    // models.forEach((model) => {
    //   this._scaffoldModels[model.name] = model;
    // });

    this._sequelizeModels = convertScaffoldModels(this._sequelize, models);

    this._allowedMethods = ["GET", "POST", "PUT", "DELETE"];
    this._sequelizeModelNames = Object.keys(this._sequelizeModels);
    // this._scaffoldModelNames = Object.keys(this._scaffoldModels)

    this._prefix = options.prefix || "";

    if (options.sync) {
      this.createDatabase();
    }
  }

  get orm(): Sequelize {
    return this._sequelize;
  }

  get parse(): { [modelName: string]: ScaffoldModelParser } {
    return buildParserForModels(this._sequelizeModels);
  }

  get model(): SequelizeModelsCollection {
    return this._sequelizeModels;
  }

  get serialize(): { [modelName: string]: ScaffoldModelSerialize } {
    return buildSerializerForModels(this._sequelizeModels);
  }

  /**
   * The `handleEverythingKoaMiddleware` Middleware provides the primary hooks
   * between your Koa application and the Scaffold library
   * @returns
   */
  handleEverythingKoaMiddleware(): Middleware {
    return async (ctx: Context, next: Next) => {
      // Check if this request takes the format of one that we expect
      if (!this.isValidScaffoldRoute(ctx.method, ctx.path)) {
        return await next();
      }

      const name = this.getScaffoldModelNameForRoute(ctx.path);
      if (!name) {
        return await next();
      }

      switch (ctx.method) {
        case "GET": {
          if (ctx.params && ctx.params.id) {
            const params = await this.parse[name].findOne(ctx.query, ctx.params.id);
            const result = await this.model[name].findByPk(ctx.params.id, params);
            const response = await this.serialize[name].findOne(result);
            ctx.body = response;
            return;
          }

          const params = await this.parse[name].findAll(ctx.query);
          const result = await this.model[name].findAll(params);
          const response = await this.serialize[name].findAll(result);
          ctx.body = response;
          return;
        }

        case "POST": {
          const body = await bodyParser(ctx);

          const params = await this.parse[name].create(body, ctx.query);
          const result = await this.model[name].create(body, params);
          const response = await this.serialize[name].create(result);
          ctx.body = response;
          return;
        }

        case "PUT": {
          const body = await bodyParser(ctx);

          const params = await this.parse[name].update(body, ctx.params);
          const result = await this.model[name].update(body, params);
          const response = await this.serialize[name].update(result);
          ctx.body = response;
          return;
        }

        case "DELETE": {
          const params = await this.parse[name].destroy(ctx.params);
          const result = await this.model[name].destroy(params);
          const response = await this.serialize[name].destroy(result);
          ctx.body = response;
          return;
        }

        default: {
          return await next();
        }
      }
    };
  }

  /**
   * This function takes the method, path, and the known list of models
   * from the Scaffold instance and determines if the current requested path
   * is one that matches a Scaffold operation.
   *
   * @param method GET, PUT, POST, DELETE, PATCH
   * @param path URL
   * @returns boolean
   */
  isValidScaffoldRoute(method, path: string): boolean {
    if (!this._allowedMethods.includes(method)) {
      return false;
    }

    const model = this.getScaffoldModelNameForRoute(path);
    if (model) {
      return true;
    } else {
      return false;
    }
  }

  getScaffoldModelNameForRoute(path: string): false | string {
    const isPathWithModelId = match<{ model: string; id: unknown }>(
      this._prefix + "/:model/:id",
      {
        decode: decodeURIComponent,
        strict: false,
        sensitive: false,
        end: false,
      }
    );

    const isPathWithModelIdResult = isPathWithModelId(path);
    if (isPathWithModelIdResult) {
      if (this._sequelizeModelNames.includes(isPathWithModelIdResult.params.model)) {
        return isPathWithModelIdResult.params.model;
      }
      return false;
    }

    const isPathWithModel = match<{ model: string }>(this._prefix + "/:model", {
      decode: decodeURIComponent,
      strict: false,
      sensitive: false,
      end: false,
    });

    const isPathWithModelResult = isPathWithModel(path);
    if (isPathWithModelResult) {
      if (this._sequelizeModelNames.includes(isPathWithModelResult.params.model)) {
        return isPathWithModelResult.params.model;
      }
      return false;
    }

    return false;
  }

  // This should mostly be used for testing. It will Sync
  // all of the known Sequelize models against the sequelize
  // instance. This is a destructive operation on a real database.
  async createDatabase(): Promise<Sequelize> {
    return this._sequelize.sync({ force: true });
  }
}
