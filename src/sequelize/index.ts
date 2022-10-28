import Koa from "koa";
import { Sequelize } from "sequelize";
import signale from "signale";
import { ScaffoldModel } from "../types";

export function prepareSequelize(app: Koa, sync?: boolean): Sequelize {
  if (!app.context.database) {
    signale.info("Creating Sequelize instance");
    const sequelize = new Sequelize("sqlite::memory:", {
      logging: (message) => {
        signale.info("  SQL:", message);
      },
    });

    signale.info("Attaching Sequelize instance to Context");
    app.context.database = sequelize;
    app.context.sync = sync;
    return sequelize;
  }
  return app.context.database;
}

export async function prepareModels(
  app: Koa,
  models: ScaffoldModel[]
): Promise<any> {
  if (!app.context.database) {
    prepareSequelize(app, true);
  }

  signale.info("Attaching Models to Sequelize instance");
  const sequelize: Sequelize = app.context.database;
  models.forEach((model) => {
    signale.info("Creating Model", model.name);
    sequelize.define(model.name, model.attributes, {
      validate: model.validation || {},
      createdAt: false,
      updatedAt: false,
      freezeTableName: true
    });
  });

  models.forEach((model) => {
    signale.info("Creating Model associations", model.name);

    const relationships = ["belongsTo", "belongsToMany", "hasOne", "hasMany", "manyToMany"];
    relationships.forEach((relationship) => {
      // For each relationship type, check if we have definitions for it:
      if (model[relationship]) {
        // Grab the array of targets and options
        model[relationship].forEach(({ target, options }) => {
          if (!target || !sequelize.models[target]) {
            throw new Error(
              "Unknown Model association for " +
              model.name +
              " in " +
              relationship
            );
          }

          // Pull the models off sequelize.models
          const current = sequelize.models[model.name];
          const associated = sequelize.models[target];

          // Create the relationship
          current[relationship](associated, options);
        });
      }
    });
  });

  signale.info("Running Sequelize Model Sync");
  if (app.context.sync) {
    await sequelize.sync({ force: true });
  }
  app.context.models = sequelize.models;
}
