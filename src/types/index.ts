import Koa, { Context, DefaultState, DefaultContext } from "koa";
import { ModelStatic, Model, Sequelize } from "sequelize";
import signale from "signale";

export interface ScaffoldApplication
  extends Koa<DefaultState, DefaultContext> {}

export interface ScaffoldModelContext extends ScaffoldContext {
  state: ScaffoldContext["state"] & {
    model: ModelStatic<Model>;
  };
}

export interface ScaffoldContext extends Context {
  state: Context["state"] & {
    logger: signale;
  };
  database: Sequelize;
  models: { [ModelName: string]: ModelStatic<Model> };
}

export interface ScaffoldModel extends ModelStatic<Model> {
  initModel: (sequelize: Sequelize) => void;
  initAssociations: (sequelize: Sequelize) => void;
}
