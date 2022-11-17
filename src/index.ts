import { Identifier, Sequelize } from "sequelize";
import { match } from "path-to-regexp";
import signale from "signale";

import {
  ExpressMiddleware,
  KoaMiddleware,
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

/**
 * Scaffold can be imported from the `@bitovi/scaffold` package
 *
 * ```ts
 * import { Scaffold, DataTypes } from "@bitovi/scaffold";
 *
 * const scaffold = new Scaffold([User], {
 *   name: "Scaffold Example",
 *   prefix: "/api",
 *   db: {
 *     dialect: "sqlite",
 *     storage: path.join(__dirname, "example.sqlite"),
 *   },
 * });
 *
 * ```
 */
export class Scaffold {
  private _sequelizeModels: SequelizeModelsCollection;
  private _sequelize: Sequelize;
  private _allowedMethods: ["GET", "POST", "PUT", "DELETE"];
  private _sequelizeModelNames: string[];
  private _prefix: string;

  /**
   * Creates a new Scaffold instance
   *
   * @param {ScaffoldModel[]} models An array of Scaffold Models
   * @param {ScaffoldOptions} options Configuration options for Scaffold
   *
   * @return {Scaffold}
   */
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
   * @return {KoaMiddleware} Koa Middleware function that can be attached to a Koa instance (`app`) using `app.use`
   */
  handleEverythingKoaMiddleware(): KoaMiddleware {
    return async (ctx, next) => {
      // Check if this request URL takes the format of one that we expect
      if (!this.isValidScaffoldRoute(ctx.method, ctx.path)) {
        return await next();
      }

      // Check if this request URL has a valid Scaffold Model associated with it
      const modelName = this.getScaffoldModelNameForRoute(ctx.path);
      if (!modelName) {
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
   * The `handleEverythingExpressMiddleware` Middleware provides the primary hooks
   * between your Express application and the Scaffold library
   *
   * It will use the Request to determine if:
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
   * @return {ExpressMiddleware} Express Middleware function that can be attached to a Koa instance (`app`) using `app.use`
   */
  handleEverythingExpressMiddleware(): ExpressMiddleware {
    return (req, res, next) => {
      // Check if this request URL takes the format of one that we expect
      if (!this.isValidScaffoldRoute(req.method, req.path)) {
        return next();
      }

      // Check if this request URL has a valid Scaffold Model associated with it
      const modelName = this.getScaffoldModelNameForRoute(req.path);
      if (!modelName) {
        return next();
      }

      throw new Error("Not Implemented");
    };
  }

  /**
   * This function takes the method, path, and the known list of models
   * from the Scaffold instance and determines if the current requested path
   * is one that matches a Scaffold operation.
   *
   * @param {string} method GET, PUT, POST, DELETE, PATCH
   * @param {string} path Usually the incoming request URL
   * @return {boolean}
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

  /**
   * This function will take a URL and attempt to pull Scaffold
   * specific parameters from it. Generally these are the `model` and or `id`
   *
   * @param path Usually the incoming request URL
   * @returns {Record<string, never> | { model: string; id: Identifier } | { model: string }}
   */
  getScaffoldURLParamsForRoute(
    path: string
  ):
    | Record<string, never>
    | { model: string; id: Identifier }
    | { model: string } {
    const isPathWithModelId = match<{ model: string; id: Identifier }>(
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
      return isPathWithModelIdResult.params;
    }

    const isPathWithModel = match<{ model: string }>(this._prefix + "/:model", {
      decode: decodeURIComponent,
      strict: false,
      sensitive: false,
      end: false,
    });

    const isPathWithModelResult = isPathWithModel(path);
    if (isPathWithModelResult) {
      return isPathWithModelResult.params;
    }

    return {};
  }

  /**
   * This function will take a URL and attempt to pull a Scaffold model name
   * parameter from it. If one is found, and valid, it will be returned.
   *
   * If there is no model, or it is not a known name, `false` will be returned
   *
   * @param {string} path Usually the incoming request URL
   * @returns {string | false} Returns a `string` with the model name, if found, otherwise `false`
   */
  getScaffoldModelNameForRoute(path: string): false | string {
    const result = this.getScaffoldURLParamsForRoute(path);
    if (result.model) {
      if (this._sequelizeModelNames.includes(result.model)) {
        return result.model;
      }
    }
    return false;
  }

  /**
   * Note: This function should primarially be used for test cases.
   *
   * The `createDatabase` function is a destructive operation that will
   * sync your defined models to the configured database.
   *
   * This means that your database will be dropped and its schema
   * will be overwritten with your defined models.
   *
   * @returns {Promise<Sequelize>} Sequelize Instance
   * @category Testing Use
   */
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
