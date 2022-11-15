import { Middleware } from "koa";
import { CreateOptions, DestroyOptions, FindOptions, Sequelize, UpdateOptions } from "sequelize";
import { match } from "path-to-regexp";

import {
  ScaffoldModel,
  ScaffoldModelParser,
  ScaffoldModelSerialize,
  ScaffoldOptions,
  SequelizeModelsCollection,
} from "./types";
import { convertScaffoldModels, createSequelizeInstance } from "./sequelize";

export class Scaffold {
  private _scaffoldModels: ScaffoldModel[];
  private _sequelizeModels: SequelizeModelsCollection;
  private _sequelize: Sequelize;
  private _allowedMethods: ['GET', 'POST', "PUT", 'DELETE']
  private _sequelizeModelNames: string[];
  private _prefix: string;

  constructor(models: ScaffoldModel[], options: ScaffoldOptions = {}) {
    // Prepare all of the ORM and keep references to the different Models
    this._sequelize = createSequelizeInstance(options.database);
    this._scaffoldModels = models;
    this._sequelizeModels = convertScaffoldModels(
      this._sequelize,
      this._scaffoldModels
    );

    this._allowedMethods = ['GET', 'POST', "PUT", 'DELETE']
    this._sequelizeModelNames = Object.keys(this._sequelizeModels)

    this._prefix = options.prefix || "";

    if (options.sync) {
      this.createDatabase();
    }
  }

  get orm(): Sequelize {
    return this._sequelize;
  }

  get parse(): ScaffoldModelParser {
    const result = {};
    Object.keys(this._sequelizeModels).forEach((key) => {
      result[key] = {
        findAll: (params): FindOptions => {
          console.log("findAll", params);
          return {};
        },
        findOne: (params): FindOptions => {
          console.log("findOne", params);
          return {};
        },
        findAndCountAll: (params): FindOptions => {
          console.log("findAndCountAll", params);
          return {};
        },
        create: (params): CreateOptions => {
          console.log("create", params);
          return {};
        },
        destroy: (params): DestroyOptions => {
          console.log("destroy", params);
          return {};
        },
        update: (params): UpdateOptions => {
          console.log("update", params);
          return {
            where: {

            }
          };
        }
      }
    });
    return result;
  }

  get model(): SequelizeModelsCollection {
    return this._sequelizeModels;
  }

  get serialize(): ScaffoldModelSerialize {
    const result = {};
    Object.keys(this._sequelizeModels).forEach((key) => {
      result[key] = {
        findAll: (data): FindOptions => {
          console.log("findAll", data);
          return data;
        },
        findOne: (data): FindOptions => {
          console.log("findOne", data);
          return data;
        },
        findAndCountAll: (data): FindOptions => {
          console.log("findAndCountAll", data);
          return data;
        },
        create: (data): CreateOptions => {
          console.log("create", data);
          return data;
        },
        destroy: (data): DestroyOptions => {
          console.log("destroy", data);
          return data;
        },
        update: (data): UpdateOptions => {
          console.log("update", data);
          return data;
        }
      }
    });
    return result;
  }

  /**
   * The `handleEverythingKoaMiddleware` Middleware provides the primary hooks
   * between your Koa application and the Scaffold library
   * @returns
   */
  handleEverythingKoaMiddleware(): Middleware {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return async function handleEverythingKoa(ctx, next) {
      // Check if this request takes the format of one that we expect
      if (!self.isValidScaffoldRoute(ctx.method, ctx.path)) {
        return await next();
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

    const model = this.getScaffoldModelForRoute(path);
    if (model) {
      return true
    } else {
      return false;
    }
  }

  getScaffoldModelForRoute(path: string): boolean | string {
    const test1 = match<{ model: string }>(this._prefix + "/:model", {
      decode: decodeURIComponent,
      strict: false,
      sensitive: false,
      end: false
    });

    const result1 = test1(path);
    if (result1) {
      if (this._sequelizeModelNames.includes(result1.params.model)) {
        return result1.params.model
      }
      return false;
    }

    const test2 = match<{ model: string, id: unknown }>(this._prefix + "/:model/:id", {
      decode: decodeURIComponent,
      strict: false,
      sensitive: false,
      end: false
    });

    const result2 = test2(path);
    if (result2) {
      if (this._sequelizeModelNames.includes(result2.params.model)) {
        return result2.params.model
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
