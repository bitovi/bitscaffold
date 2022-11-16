import { Context, Middleware, Next } from "koa";
import { Identifier, Sequelize } from "sequelize";
import { match } from "path-to-regexp";
import signale from "signale";

import {
  ScaffoldFunctionExportEverything,
  ScaffoldFunctionExportHandler,
  ScaffoldFunctionExportParse,
  ScaffoldFunctionExportsCollection,
  ScaffoldFunctionExportSerialize,
  ScaffoldFunctionExportsMiddleware,
  ScaffoldModel,
  ScaffoldModelCollection,
  ScaffoldOptions,
  SequelizeModelsCollection,
} from "./types";
import {
  convertScaffoldModels,
  createSequelizeInstance,
  buildScaffoldModelObject,
} from "./sequelize";
import { buildParserForModel } from "./parse";
import { buildSerializerForModel } from "./serialize";
import { buildMiddlewareForModel } from "./middleware";
import { buildEverythingForModel } from "./everything";

export class Scaffold {
  private _sequelizeModels: SequelizeModelsCollection;
  private _sequelize: Sequelize;
  private _allowedMethods: ["GET", "POST", "PUT", "DELETE"];
  private _sequelizeModelNames: string[];
  private _prefix: string;

  constructor(models: ScaffoldModel[], options: ScaffoldOptions = {}) {
    // Prepare the ORM instance and keep references to the different Models
    this._sequelize = createSequelizeInstance(options.database);
    this._sequelizeModels = convertScaffoldModels(this._sequelize, models);

    // Types of requests that Scaffold should attempt to process
    this._allowedMethods = ["GET", "POST", "PUT", "DELETE"];

    // Do some quick work up front to get the list of model names
    this._sequelizeModelNames = Object.keys(this._sequelizeModels);

    // Store the route prefix if the user set one
    this._prefix = options.prefix || "";

    if (options.sync) {
      this.createDatabase();
    }
  }

  /**
   * Returns the raw Sequelize instance directly
   */
  get orm(): Sequelize {
    return this._sequelize;
  }

  /**
   * Returns an object mapping model names to Sequelize models
   */
  get model(): SequelizeModelsCollection {
    return this._sequelizeModels;
  }

  /**
   * Returns an object mapping model names to Scaffold models
   */
  get models(): ScaffoldModelCollection {
    return buildScaffoldModelObject(this._sequelizeModels);
  }

  /**
   * Returns an object containing the model names as keys
   */
  get parse() {
    return buildExportWrapper<ScaffoldFunctionExportParse>(
      this,
      buildParserForModel
    );
  }

  /**
   * Returns an object containing the model names as keys
   */
  get serialize() {
    return buildExportWrapper<ScaffoldFunctionExportSerialize>(
      this,
      buildSerializerForModel
    );
  }

  /**
   * Returns an object containing the model names as keys
   */
  get middleware() {
    return buildExportWrapper<ScaffoldFunctionExportsMiddleware>(
      this,
      buildMiddlewareForModel
    );
  }

  /**
   * Returns an object containing the model names as keys
   */
  get everything() {
    return buildExportWrapper<ScaffoldFunctionExportEverything>(
      this,
      buildEverythingForModel
    );
  }

  /**
   * The `handleEverythingKoaMiddleware` Middleware provides the primary hooks
   * between your Koa application and the Scaffold library
   *
   * It will use the Koa Context to determine if:
   *    1. The route resembles a Scaffold default route, by regex
   *    2. The route contains an expected Scaffold model name
   *    3. The request method is one of GET, POST, PUT, DELETE
   *
   * If these criteria pass the context will be passed to the 'everything'
   * function for the given model. Under the hood this will parse the params,
   * perform the requested model query, and serialize the result.
   *
   * If these criteria are not met the request will be ignored by
   * Scaffold and the request passed to the next available Middleware
   *
   * @returns
   */
  handleEverythingKoaMiddleware(): Middleware {
    return async (ctx: Context, next: Next) => {
      signale.pending("handleEverythingKoaMiddleware");
      // Check if this request takes the format of one that we expect
      if (!this.isValidScaffoldRoute(ctx.method, ctx.path)) {
        signale.success("handleEverythingKoaMiddleware, not a scaffold route");
        return await next();
      }

      const modelName = this.getScaffoldModelNameForRoute(ctx.path);
      if (!modelName) {
        signale.success("handleEverythingKoaMiddleware, not a scaffold model");
        return await next();
      }

      switch (ctx.method) {
        case "GET": {
          if (ctx.query && ctx.query.id) {
            ctx.body = await this.everything[modelName].findOne(
              ctx.query,
              ctx.query.id as Identifier
            );
            return;
          }
          ctx.body = await this.everything[modelName].findAll(ctx.query);
          return;
        }

        case "POST": {
          ctx.body = await this.everything[modelName].create(ctx);
          return;
        }

        case "PUT": {
          ctx.body = await this.everything[modelName].update(ctx);
          return;
        }

        case "DELETE": {
          ctx.body = await this.everything[modelName].destroy(ctx.query);
          return;
        }

        default: {
          signale.success(
            "handleEverythingKoaMiddleware, scaffold ignored method"
          );
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
      if (
        this._sequelizeModelNames.includes(isPathWithModelIdResult.params.model)
      ) {
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
      if (
        this._sequelizeModelNames.includes(isPathWithModelResult.params.model)
      ) {
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

function buildExportWrapper<T>(
  scaffold: Scaffold,
  handlerFunction: ScaffoldFunctionExportHandler<T>
): ScaffoldFunctionExportsCollection<T> {
  const wrapper = {};
  Object.keys(scaffold.models).forEach((modelName) => {
    wrapper[modelName] = handlerFunction(scaffold, modelName);
  });

  return wrapper;
}
