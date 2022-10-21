import { Model, DataTypes, ModelAttributes } from "sequelize";
import {
  BelongsToManyResult,
  LoadedModels,
  ScaffoldAttributes,
  ScaffoldModelBase,
} from "../../../types";

export default class Actor extends ScaffoldModelBase {
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
    return [{ target: models.Movie, options: { through: "ActorMovies" } }];
  }
}
