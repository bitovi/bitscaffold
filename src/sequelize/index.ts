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
  const sequelize = app.context.database;
  models.forEach((model) => {
    signale.info("Creating Model", model.name);
    model.initModel(sequelize);
  });

  models.forEach((model) => {
    signale.info("Creating Model associations", model.name);
    model.initAssociations(sequelize);
  });

  signale.info("Running Sequelize Model Sync");
  await sequelize.sync({ force: true });
  app.context.models = sequelize.models;
}
