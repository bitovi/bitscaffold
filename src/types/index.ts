import Koa, { Context, DefaultState, DefaultContext } from "koa";
import { Sequelize, Model, BelongsToManyOptions, ModelValidateOptions, ModelAttributes, ModelStatic, BelongsToOptions, HasOneOptions, HasManyOptions } from "sequelize";
import signale from "signale";

export interface ScaffoldApplication
  extends Koa<DefaultState, DefaultContext> { }

export interface ScaffoldModelContext extends ScaffoldContext {
  state: ScaffoldContext["state"] & {
    model: ModelStatic<Model>;
  };
}

export interface LoadedModels {
  [key: string]: ModelStatic<Model<any, any>>;
}

export interface BelongsToManyResult {
  target: ModelStatic<Model<any, any>>
  options: BelongsToManyOptions
}

export interface BelongsToResult {
  target: ModelStatic<Model<any, any>>
  options?: BelongsToOptions
}

export interface HasOneResult {
  target: ModelStatic<Model<any, any>>
  options?: HasOneOptions
}

export interface HasManyResult {
  target: ModelStatic<Model<any, any>>
  options?: HasManyOptions
}


export interface ScaffoldContext extends Context {
  state: Context["state"] & {
    logger: signale;
  };
  database: Sequelize;
  models: { [ModelName: string]: ModelStatic<Model> };
}

export abstract class ScaffoldModelBase {
  tableName?: string;
  tablePluralName?: string;
  declare name: string;

  useCreatedAt: boolean;
  useUpdatedAt: boolean;

  abstract attributes(): ModelAttributes;
  validation(): ModelValidateOptions {
    return {};
  }

  belongsTo(models: LoadedModels): BelongsToResult[] {
    return [];
  }

  belongsToMany(models: LoadedModels): BelongsToManyResult[] {
    return [];
  }

  hasOne(models: LoadedModels): HasOneResult[] {
    return [];
  }

  hasMany(models: LoadedModels): HasManyResult[] {
    return [];
  }
}
