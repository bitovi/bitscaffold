import { Model, DataTypes, Sequelize, ModelAttributes } from "sequelize";
import { HasManyResult, Models, ScaffoldModelBase } from "../../../sequelize";

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

  hasMany(models: Models): HasManyResult[] {
    return [{ target: models.Player, options: { as: "players" } }];
  }
}
