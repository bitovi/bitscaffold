import Koa from "koa";
import { Sequelize } from "sequelize";
import signale from "signale";
import { ScaffoldModel } from "../types";

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
  models: ScaffoldModel[]
): Promise<any> {
  if (!app.context.database) {
    await prepareSequelize(app);
  }

  signale.info("Attaching Models to Sequelize instance");
  const sequelize: Sequelize = app.context.database;
  models.forEach((model) => {
    const modelName = model.constructor.name;
    signale.info("Creating Model", modelName);
    sequelize.define(modelName, model.attributes, {
      validate: model.validation,
      createdAt: model.useCreatedAt || false,
      updatedAt: model.useUpdatedAt || false,
    });
  });

  models.forEach((model) => {
    const modelName = model.constructor.name;
    signale.info("Creating Model associations", modelName);

    const relationships = ["belongsTo", "belongsToMany", "hasOne", "hasMany"];
    relationships.forEach((relationship) => {
      if (model[relationship]) {
        model[relationship](sequelize.models).forEach(({ target, options }) => {
          if (!target) {
            throw new Error(
              "Unknown Model association for " +
                modelName +
                " in " +
                relationship
            );
          }
          sequelize.models[modelName][relationship](target, options);
        });
      }
    });
  });

  signale.info("Running Sequelize Model Sync");
  await sequelize.sync({ force: true });
  app.context.models = sequelize.models;
}
