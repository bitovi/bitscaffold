import Koa, { Context, DefaultState, DefaultContext } from "koa";
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
} from "sequelize";
import signale from "signale";

export { DataTypes } from "sequelize";

export interface ScaffoldOptions {
  prefix?: string;
  sync?: boolean;
  database?: Options;
}

export type SequelizeModelsCollection = {
  [key: string]: ModelCtor<Model<any, any>>;
};

export interface ScaffoldModelParser {
  [key: string]: {
    // eslint-disable-next-line no-unused-vars
    findAll: (params: unknown) => FindOptions;
    // eslint-disable-next-line no-unused-vars
    findOne: (params: unknown) => FindOptions;
    // eslint-disable-next-line no-unused-vars
    findAndCountAll: (params: unknown) => FindOptions;
    // eslint-disable-next-line no-unused-vars
    create: (params: unknown) => CreateOptions;
    // eslint-disable-next-line no-unused-vars
    destroy: (params: unknown) => DestroyOptions;
    // eslint-disable-next-line no-unused-vars
    update: (params: unknown) => UpdateOptions;
  };
}

export type ScaffoldSerializedResponse = Record<string, unknown>;

export interface ScaffoldModelSerialize {
  [key: string]: {
    // eslint-disable-next-line no-unused-vars
    findAll: (data: unknown) => ScaffoldSerializedResponse;
    // eslint-disable-next-line no-unused-vars
    findOne: (data: unknown) => ScaffoldSerializedResponse;
    // eslint-disable-next-line no-unused-vars
    findAndCountAll: (data: unknown) => ScaffoldSerializedResponse;
    // eslint-disable-next-line no-unused-vars
    create: (data: unknown) => ScaffoldSerializedResponse;
    // eslint-disable-next-line no-unused-vars
    destroy: (data: unknown) => ScaffoldSerializedResponse;
    // eslint-disable-next-line no-unused-vars
    update: (data: unknown) => ScaffoldSerializedResponse;
  };
}

export type ScaffoldModelAccessor = any;

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
