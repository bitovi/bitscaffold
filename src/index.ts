import { Identifier, Sequelize } from "sequelize";
import { match } from "path-to-regexp";
import signale from "signale";
import {
  Error as SerializedError,
  JSONAPIErrorOptions,
} from "jsonapi-serializer";
import createHttpError from "http-errors";

import {
  ExpressMiddleware,
  KoaMiddleware,
  ScaffoldModel,
  ScaffoldModelCollection,
  ScaffoldOptions,
  SequelizeModelsCollection,
  FunctionsHandler,
  ModelFunctionsCollection,
} from "./types";
import {
  convertScaffoldModels,
  createSequelizeInstance,
  buildScaffoldModelObject,
} from "./sequelize";
import { buildParserForModel, ParseFunctions } from "./parse";
import { parseScaffoldBody } from "./parse/body";

import { buildSerializerForModel, SerializeFunctions } from "./serialize";
import { buildDeserializerForModel, DeserializeFunctions } from "./deserialize";
import { buildMiddlewareForModel, MiddlewareFunctionsKoa } from "./middleware";
import { buildEverythingForModel, EverythingFunctions } from "./everything";

/**
 * Scaffold can be imported from the `@bitovi/scaffold` package
 *
 * This class provides the entry point into the Scaffold library. To use Scaffold with your project
 * you will create an instance of this class passing it your Model definitions along with (optional) settings.
 *
 * @see {@link constructor}
 *
 * In order to use Scaffold with Koa or Express you should look at the Middleware exports below
 * @see {@link handleEverythingExpressMiddleware}
 * @see {@link handleEverythingKoaMiddleware}
 *
 */
export class Scaffold {
  private _sequelizeModels: SequelizeModelsCollection;
  private _sequelize: Sequelize;
  private _allowedMethods: ["GET", "POST", "PUT", "DELETE"];
  private _sequelizeModelNames: string[];
  private _prefix: string;
  private _exposeErrors: boolean;

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

    // Store the error expose settings if the user set it
    this._exposeErrors = options.expose || false;

    if (options.sync) {
      this.createDatabase();
    }
  }

  /**
   * Returns the raw Sequelize instance directly
   * @hidden
   */
  get orm(): Sequelize {
    return this._sequelize;
  }

  /**
   * The `model` export is one of the primary tools provided by Scaffold for working
   * with your Models in custom routes.
   *
   * From the `model` export you can target one of your Models by name which will
   * give you further access to a number of named functions
   *
   *
   * @returns {SequelizeModelsCollection}
   * @category General Use
   */
  get model(): SequelizeModelsCollection {
    return this._sequelizeModels;
  }

  /**
   * Returns an object mapping model names to Scaffold models
   * @hidden
   */
  get models(): ScaffoldModelCollection {
    return buildScaffoldModelObject(this._sequelizeModels);
  }

  /**
   * The `parse` export is one of the primary tools provided by Scaffold for working
   * with your Models in custom routes.
   *
   * From the `parse` export you can target one of your Models by name which will
   * give you further access to a number of named functions
   *
   * For more information about the underlying per-model functions:
   * @see {@link ParseFunctions}
   *
   * @returns {ModelFunctionsCollection<ParseFunctions>}
   * @category General Use
   */
  get parse() {
    return buildExportWrapper<ParseFunctions>(this, buildParserForModel);
  }

  /**
   * The `serialize` export is one of the primary tools provided by Scaffold for working
   * with your Models in custom routes.
   *
   * From the `serialize` export you can target one of your Models by name which will
   * give you further access to a number of named functions
   *
   * For more information about the underlying per-model functions:
   * @see {@link SerializeFunctions}
   *
   * @returns {ModelFunctionsCollection<SerializeFunctions>}
   * @category General Use
   */
  get serialize() {
    return buildExportWrapper<SerializeFunctions>(
      this,
      buildSerializerForModel
    );
  }

  /**
   * The `deserialize` export is one of the primary tools provided by Scaffold for working
   * with your Models in custom routes.
   *
   * From the `deserialize` export you can target one of your Models by name which will
   * give you further access to a number of named functions
   *
   * For more information about the underlying per-model functions:
   * @see {@link DeserializeFunctions}
   *
   * @returns {ModelFunctionsCollection<DeserializeFunctions>}
   * @category General Use
   */
  get deserialize() {
    return buildExportWrapper<DeserializeFunctions>(
      this,
      buildDeserializerForModel
    );
  }

  /**
   * Create a JSON:API Compliant Error Result
   *
   * The behavior of this function depends on the value of `expose` set
   * in the Scaffold options. If `expose` is true then additional details
   * will be returned to the client.
   *
   * If `expost` is false only the HTTP error code and high level message
   * will be returned to the client.
   *
   * @param {JSONAPIErrorOptions} options
   * @returns { createHttpError.HttpError}
   */
  createError(options: JSONAPIErrorOptions): createHttpError.HttpError {
    const error = createHttpError(
      Number.parseInt(options.code || "500"),
      new SerializedError(options)
    );
    error.expose = this._exposeErrors;

    console.error(error);
    return error;
  }

  /**
   * The `middleware` export is one of the primary tools provided by Scaffold for working
   * with your Models in custom routes.
   *
   * From the `middleware` export you can target one of your Models by name which will
   * give you further access to a number of named functions
   *
   * For more information about the underlying per-model functions:
   * @see {@link MiddlewareFunctionsKoa}
   *
   * @returns {ModelFunctionsCollection<MiddlewareFunctionsKoa>}
   * @category General Use
   */
  get middleware() {
    return buildExportWrapper<MiddlewareFunctionsKoa>(
      this,
      buildMiddlewareForModel
    );
  }

  /**
   * The `everything` export is one of the primary tools provided by Scaffold for working
   * with your Models in custom routes.
   *
   * The `everything` export calls the `parse`, `model`, and `serialize` under the hood
   * allowing you to do 'everything' in one function instead of calling each part individually.
   *
   * From the `everything` export you can target one of your Models by name which will
   * give you further access to a number of named functions
   *
   * For more information about the underlying per-model functions:
   * @see {@link EverythingFunctions}
   *
   * @returns {ModelFunctionsCollection<EverythingFunctions>}
   * @category General Use
   */
  get everything() {
    return buildExportWrapper<EverythingFunctions>(
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
   * Valid Scaffold URLs formats
   *
   * - `[prefix]/:model`
   * - `[prefix]/:model/:id `
   *
   * @return {KoaMiddleware} Koa Middleware function that can be attached to a Koa instance (`app`) using `app.use`
   * @category General Use
   */
  handleEverythingKoaMiddleware(): KoaMiddleware {
    return async (ctx, next) => {
      // Check if this request URL takes the format of one that we expect
      if (!this.isValidScaffoldRoute(ctx.method, ctx.path)) {
        return await next();
      }

      const params = this.getScaffoldURLParamsForRoute(ctx.path);
      if (!params.model) {
        return await next();
      }

      switch (ctx.method) {
        case "GET": {
          if (params.id) {
            ctx.body = await this.everything[params.model].findOne(
              ctx.query,
              params.id
            );
            return;
          }
          ctx.body = await this.everything[params.model].findAll(ctx.query);
          return;
        }

        case "POST": {
          const body = await parseScaffoldBody(ctx, ctx.request.type);
          ctx.body = await this.everything[params.model].create(
            body,
            ctx.query
          );
          return;
        }

        case "PUT": {
          const body = await parseScaffoldBody(ctx, ctx.request.type);
          ctx.body = await this.everything[params.model].update(
            body,
            ctx.query,
            params.id
          );
          return;
        }

        case "DELETE": {
          ctx.body = await this.everything[params.model].destroy(
            ctx.query,
            params.id
          );
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
   * Valid Scaffold URLs formats
   *
   * - `[prefix]/:model`
   * - `[prefix]/:model/:id `
   *
   * @return {ExpressMiddleware} Express Middleware function that can be attached to a Koa instance (`app`) using `app.use`
   * @category General Use
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
   * Note: While this function is exported from Scaffold it is unusual to need to it externally
   *
   * @param {string} method GET, PUT, POST, DELETE, PATCH
   * @param {string} path Usually the incoming request URL
   * @return {boolean}
   * @internal
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
   * Note: While this function is exported from Scaffold it is unusual to need to it externally
   *
   * @param path Usually the incoming request URL
   * @returns { model?: string; id?: Identifier }
   * @internal
   */
  getScaffoldURLParamsForRoute(path: string): {
    model?: string;
    id?: Identifier;
  } {
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
   * Note: While this function is exported from Scaffold it is unusual to need to it externally
   *
   * @param {string} path Usually the incoming request URL
   * @returns {string | false} Returns a `string` with the model name, if found, otherwise `false`
   * @internal
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
  handlerFunction: FunctionsHandler<T>
): ModelFunctionsCollection<T> {
  const wrapper: ModelFunctionsCollection<T> = {};
  Object.keys(scaffold.models).forEach((modelName) => {
    wrapper[modelName] = handlerFunction(scaffold, modelName);
  });

  return wrapper;
}
