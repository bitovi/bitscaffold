import { Model, DataTypes, ModelAttributes } from "sequelize";
import {
  BelongsToManyResult,
  LoadedModels,
  ScaffoldModelBase,
  ScaffoldAttributes,
} from "../../../types";

export default class Movie extends ScaffoldModelBase {
  attributes(): ScaffoldAttributes {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: DataTypes.STRING,
    };
  }

  belongsToMany(models: LoadedModels): BelongsToManyResult[] {
    return [{ target: models.Actor, options: { through: "ActorMovies" } }];
  }
}
