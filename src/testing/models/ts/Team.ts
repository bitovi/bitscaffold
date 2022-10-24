import { DataTypes } from "sequelize";
import { HasManyResult, LoadedModels, ScaffoldModel } from "../../../types";

export const Team: ScaffoldModel = {
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
  },

  hasMany(models: LoadedModels): HasManyResult[] {
    return [{ target: models.Player, options: { as: "players" } }];
  },
};
