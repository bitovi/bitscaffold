import { Model, Sequelize, Options } from "sequelize";
import signale from "signale";
import {
  ScaffoldModel,
  SequelizeModelsCollection,
  ScaffoldSymbolModel,
} from "../types";

export function createSequelizeInstance(options?: Options): Sequelize {
  if (!options) {
    signale.info("Using in-memory database, no persistance configured");
    return new Sequelize("sqlite::memory:", {
      logging: (message) => {
        signale.info(" DB: ", message);
      },
    });
  }

  signale.info("Creating Sequelize instance with options:", options);
  const sequelize = new Sequelize(options);
  return sequelize;
}

export function convertScaffoldModels(
  sequelize: Sequelize,
  models: ScaffoldModel[]
): SequelizeModelsCollection {
  signale.info("Attaching Models to Sequelize instance");
  models.forEach((model) => {
    signale.info("Creating Model", model.name);
    const temp = sequelize.define<Model<ScaffoldModel["attributes"]>>(
      model.name,
      model.attributes,
      {
        validate: model.validation || {},
        createdAt: false,
        updatedAt: false,
        freezeTableName: true,
      }
    );

    temp[ScaffoldSymbolModel] = model;
  });

  models.forEach((model) => {
    signale.info("Creating Model associations", model.name);

    const relationships = [
      "belongsTo",
      "belongsToMany",
      "hasOne",
      "hasMany",
      "manyToMany",
    ];
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

  return sequelize.models as SequelizeModelsCollection;
}
