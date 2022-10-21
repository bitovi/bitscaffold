import { DataTypes } from "sequelize";
import {
  HasManyResult,
  LoadedModels,
  ScaffoldModelBase,
  ScaffoldAttributes,
} from "../../../types";

export default class Team extends ScaffoldModelBase {
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

  hasMany(models: LoadedModels): HasManyResult[] {
    return [{ target: models.Player, options: { as: "players" } }];
  }
}
