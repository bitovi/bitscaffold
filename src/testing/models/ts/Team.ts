import { Model, DataTypes, ModelAttributes } from "sequelize";
import { HasManyResult, LoadedModels, ScaffoldModelBase } from "../../../types";

export default class Team extends ScaffoldModelBase {
  attributes(): ModelAttributes<Model<any, any>, any> {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: DataTypes.STRING,
    }
  }

  hasMany(models: LoadedModels): HasManyResult[] {
    return [{ target: models.Player, options: { as: "players" } }];
  }
}
