import { Model, Sequelize } from "sequelize";
import signale from "signale";
import { ScaffoldModel } from "../types";

export function convertScaffoldModels<T extends ScaffoldModel>(
  sequelize: Sequelize,
  models: T[]
): void {
  signale.info("Attaching Models to Sequelize instance");
  models.forEach((model) => {
    signale.info("Creating Model", model.name);
    sequelize.define<Model<T['attributes']>>(model.name, model.attributes, {
      validate: model.validation || {},
      createdAt: false,
      updatedAt: false,
      freezeTableName: true,
    });
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
}
