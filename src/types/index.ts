/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import Koa, { Context, DefaultState, DefaultContext, Middleware } from "koa";
import { ParsedUrlQuery } from "querystring";
import {
  Sequelize,
  Model,
  BelongsToManyOptions,
  ModelValidateOptions,
  ModelAttributes,
  ModelStatic,
  BelongsToOptions,
  HasOneOptions,
  HasManyOptions,
  Options,
  ModelCtor,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
  Identifier,
} from "sequelize";
import signale from "signale";
import { Scaffold } from "..";

export { DataTypes } from "sequelize";

export type KoaMiddleware = Middleware;
export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/**
 * Options Description Does This Show In Docs?
 */
export interface ScaffoldOptions {
  prefix?: string;
  sync?: boolean;
  database?: Options;
}

export const ScaffoldSymbolModel = Symbol("scaffold");

export type SequelizeModelInstance = ModelCtor<Model<any, any>> & {
  [ScaffoldSymbolModel]: ScaffoldModel;
};

export type SequelizeModelsCollection = {
  [key: string]: SequelizeModelInstance;
};

export type ScaffoldModelCollection = {
  [key: string]: ScaffoldModel;
};

export type ScaffoldSerializedResponse = Record<string, unknown>;

export interface ScaffoldFunctionExportParse {
  /**
   * Parses the parameters for the provided Model oo prepare
   * the options needed for an ORM findAll query
   *
   * In most normal use cases this can come directly from the
   * Koa Context as `ctx.query`
   *
   */
  findAll: (query: ParsedUrlQuery) => Promise<FindOptions>;
  findOne: (query: ParsedUrlQuery, id: Identifier) => Promise<FindOptions>;
  findAndCountAll: (query: ParsedUrlQuery) => Promise<FindOptions>;
  create: (body: any, query: ParsedUrlQuery) => Promise<CreateOptions>;
  update: (body: any, query: ParsedUrlQuery) => Promise<UpdateOptions>;
  destroy: (query: ParsedUrlQuery) => Promise<DestroyOptions>;
}

export interface ScaffoldFunctionExportSerialize {
  /**
   * Takes a Model instance and converts it into a
   * JSON:API serialized response that can be returned
   * to the caller
   *
   * In most normal use cases this can come directly from the
   * output of a Model query operation.
   *
   * @returns JSON:API Response
   */
  findAll: (params: any) => Promise<ScaffoldSerializedResponse>;
  findOne: (params: any) => Promise<ScaffoldSerializedResponse>;
  findAndCountAll: (params: any) => Promise<ScaffoldSerializedResponse>;
  create: (params: any) => Promise<ScaffoldSerializedResponse>;
  update: (params: any) => Promise<ScaffoldSerializedResponse>;
  destroy: (params: any) => Promise<ScaffoldSerializedResponse>;
}

export interface ScaffoldFunctionExportsMiddleware {
  findAll: Middleware;
  findOne: Middleware;
  findAndCountAll: Middleware;
  create: Middleware;
  update: Middleware;
  destroy: Middleware;
}

export interface ScaffoldFunctionExportEverything {
  findAll: (query: ParsedUrlQuery) => Promise<ScaffoldSerializedResponse>;
  findOne: (
    query: ParsedUrlQuery,
    id: Identifier
  ) => Promise<ScaffoldSerializedResponse>;
  findAndCountAll: (
    query: ParsedUrlQuery
  ) => Promise<ScaffoldSerializedResponse>;
  create: (ctx: Context) => Promise<ScaffoldSerializedResponse>;
  update: (ctx: Context) => Promise<ScaffoldSerializedResponse>;
  destroy: (query: ParsedUrlQuery) => Promise<ScaffoldSerializedResponse>;
}

export interface ScaffoldFunctionExportsCollection<T> {
  [modelName: string]: T;
}

export type ScaffoldFunctionExportHandler<T> = (
  scaffold: Scaffold,
  name: string
) => T;

export type ScaffoldAttributes = ModelAttributes<Model>;
export type ScaffoldApplication = Koa<DefaultState, DefaultContext>;

export interface ScaffoldModelContext extends ScaffoldContext {
  state: ScaffoldContext["state"] & {
    model: ModelStatic<Model>;
  };
}

export interface LoadedModels {
  [key: string]: ModelStatic<Model>;
}

export interface BelongsToManyResult {
  target: string;
  options: BelongsToManyOptions;
}

export interface BelongsToResult {
  target: string;
  options?: BelongsToOptions;
}

export interface HasOneResult {
  target: string;
  options?: HasOneOptions;
}

export interface HasManyResult {
  target: string;
  options?: HasManyOptions;
}

export interface ScaffoldContext extends Context {
  state: Context["state"] & {
    logger: signale;
  };
  database: Sequelize;
  models: { [ModelName: string]: ModelStatic<Model> };
}

export interface ScaffoldModel {
  attributes: ModelAttributes;

  name: string;

  validation?: ModelValidateOptions;

  belongsTo?: BelongsToResult[];
  belongsToMany?: BelongsToManyResult[];
  hasOne?: HasOneResult[];
  hasMany?: HasManyResult[];
}
