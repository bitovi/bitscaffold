// Library Functions
import { Middleware } from "koa";
import { Sequelize } from "sequelize";

import { ScaffoldModel, ScaffoldOptions } from "./types";
import { convertScaffoldModels } from "./sequelize";
import { prepareSequelizeInstance } from "./libs";

export class Scaffold<T extends ScaffoldModel> {
  private _models: T[];
  private sequelize: Sequelize;
  private prefix: string;

  constructor(models: T[], options: ScaffoldOptions = {}) {
    this._models = models;
    this.sequelize = prepareSequelizeInstance(options.database);
    this.prefix = options.prefix || "/";

    convertScaffoldModels<T>(this.sequelize, this._models);

    if (options.sync) {
      this.createDatabase();
    }
  }

  /**
   * The `handleEverythingKoaMiddleware` Middleware provides the primary hooks
   * between your Koa application and the Scaffold library
   * @returns 
   */
  handleEverythingKoaMiddleware(): Middleware {
    return async function handleEverythingKoa(ctx, next) {
      if (!this.isValidScaffoldRoute(ctx.method, ctx.path)) {
        return await next();
      }

      // Get the Model from the URL
      const modelForRoute = getModelNameForRoute(ctx.path);
      const modelOperationForRoute = getModelOperationForRoute(ctx.method);
      const query = this.parseDefaultKoaParams(modelForRoute, modelOperationForRoute)
      const data = await this._models[modelForRoute][modelOperationForRoute](query)
      const jsonApiResponse = this.serializeToJSONAPI(data);
      
      ctx.body = jsonApiResponse;
      ctx.status = 200;
    }
  }

  /**
   * The `handleEverythingExpressMiddleware` Middleware provides the primary hooks
   * between your Express application and the Scaffold library
   * @returns 
   */
  handleEverythingExpressMiddleware(): any {
    return function handleEverythingExpress(req, res, next) {
      if (!this.isValidScaffoldRoute(req.method, req.path)) {
        return next();
      }

      // Get the Model from the URL
      const modelForRoute = getModelNameForRoute(req.path);
      const modelOperationForRoute = getModelOperationForRoute(req.method);
      const query = this.parseDefaultKoaParams(modelForRoute, modelOperationForRoute)
      this._models[modelForRoute][modelOperationForRoute](query).then((data) => {
        const jsonApiResponse = this.serializeToJSONAPI(data);
        res.send(jsonApiResponse);
      });
    }
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
  isValidScaffoldRoute(method, path) {
    return method + path;
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


/**
 * This function should parse the model name from the URL path
 * @param path URL
 * @returns {string} Model Name
 */
function getModelNameForRoute(path): string {
  throw new Error("Not Implemented", path)
}

/**
 * This function should determine the model query
 * operation to use based on Method
 * @param path URL
 * @returns {string} Model Name
 */
function getModelOperationForRoute(ctx): string {
  switch (ctx.method) {
    case "POST": {
      return "create"
    }

    case "GET": {
      if (ctx.params.id) {
        return "findOne"
      }
      return "findAll"
    }

    case "PUT": {
      return "update"
    }

    case "DELETE": {
      return "delete"
    }

    default: {
      throw new Error("Unhandled Method", ctx.method);
    }
  }
}

