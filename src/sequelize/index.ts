import { Model, Sequelize, Options } from "@sequelize/core";
import {
  ScaffoldModel,
  SequelizeModelsCollection,
  ScaffoldSymbolModel,
  ScaffoldModelCollection,
} from "../types";

export function buildScaffoldModelObject(
  models: SequelizeModelsCollection
): ScaffoldModelCollection {
  const names = Object.keys(models);

  const result: ScaffoldModelCollection = {};
  names.forEach((name) => {
    result[name] = models[name][ScaffoldSymbolModel];
  });
  return result;
}

export function createSequelizeInstance(options?: Options): Sequelize {
  if (!options) {
    return new Sequelize("sqlite::memory:", {
      logging: false,
    });
  }

  const sequelize = new Sequelize(options);
  return sequelize;
}

export function convertScaffoldModels(
  sequelize: Sequelize,
  models: ScaffoldModel[]
): SequelizeModelsCollection {
  models.forEach((model) => {
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
