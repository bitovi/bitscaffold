import Koa from "koa";
import { Sequelize } from "sequelize";
import signale from "signale";
import { ScaffoldModelBase } from "../types";

export async function prepareSequelize(app: Koa, sync?: boolean): Promise<any> {
  if (!app.context.database) {
    signale.info("Creating Sequelize instance");
    const sequelize = new Sequelize("sqlite::memory:", {
      logging: (message) => {
        signale.info("  SQL:", message);
      },
    });

    signale.info("Attaching Sequelize instance to Context");
    app.context.database = sequelize;
    return sequelize;
  }
}

export async function prepareModels(
  app: Koa,
  models: ScaffoldModelBase[]
): Promise<any> {
  if (!app.context.database) {
    await prepareSequelize(app);
  }

  signale.info("Attaching Models to Sequelize instance");
  const sequelize: Sequelize = app.context.database;
  models.forEach((model) => {
    const modelName = model.constructor.name;
    signale.info("Creating Model", modelName);
    sequelize.define(modelName, model.attributes(), {
      validate: model.validation(),
      createdAt: model.useCreatedAt || false,
      updatedAt: model.useUpdatedAt || false
    })
  });

  models.forEach((model) => {
    const modelName = model.constructor.name;
    signale.info("Creating Model associations", modelName);
    model.belongsTo(sequelize.models).forEach(({ target, options }) => {
      if (!target) {
        throw new Error("Unknown Model association for " + modelName + " in belongsTo");
      }
      sequelize.models[modelName].belongsTo(target, options);
    });

    model.belongsToMany(sequelize.models).forEach(({ target, options }) => {
      if (!target) {
        throw new Error("Unknown Model association for " + modelName + " in belongsToMany");
      }
      sequelize.models[modelName].belongsToMany(target, options);
    });

    model.hasOne(sequelize.models).forEach(({ target, options }) => {
      if (!target) {
        throw new Error("Unknown Model association for " + modelName + " in hasOne");
      }
      sequelize.models[modelName].hasOne(target, options);
    });

    model.hasMany(sequelize.models).forEach(({ target, options }) => {
      if (!target) {
        throw new Error("Unknown Model association for " + modelName + " in hasMany");
      }
      sequelize.models[modelName].hasMany(target, options);
    });
  });

  signale.info("Running Sequelize Model Sync");
  await sequelize.sync({ force: true });
  app.context.models = sequelize.models;
}
