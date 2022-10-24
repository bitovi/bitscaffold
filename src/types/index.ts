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
} from "sequelize";
import signale from "signale";

export interface ScaffoldAttributes
  extends ModelAttributes<Model<any, any>, any> {}

export interface ScaffoldApplication
  extends Koa<DefaultState, DefaultContext> {}

export interface ScaffoldModelContext extends ScaffoldContext {
  state: ScaffoldContext["state"] & {
    model: ModelStatic<Model>;
  };
}

export interface LoadedModels {
  [key: string]: ModelStatic<Model<any, any>>;
}

export interface BelongsToManyResult {
  target: ModelStatic<Model<any, any>>;
  options: BelongsToManyOptions;
}

export interface BelongsToResult {
  target: ModelStatic<Model<any, any>>;
  options?: BelongsToOptions;
}

export interface HasOneResult {
  target: ModelStatic<Model<any, any>>;
  options?: HasOneOptions;
}

export interface HasManyResult {
  target: ModelStatic<Model<any, any>>;
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
  attributes: ScaffoldAttributes;

  tableName?: string;
  tablePluralName?: string;

  useCreatedAt?: boolean;
  useUpdatedAt?: boolean;

  validation?: ModelValidateOptions;

  belongsTo?(models: LoadedModels): BelongsToResult[];
  belongsToMany?(models: LoadedModels): BelongsToManyResult[];
  hasOne?(models: LoadedModels): HasOneResult[];
  hasMany?(models: LoadedModels): HasManyResult[];
}
