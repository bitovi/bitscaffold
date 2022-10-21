import { Model, DataTypes, ModelAttributes } from "sequelize";
import { BelongsToManyResult, Models, ScaffoldModelBase } from "../../../sequelize";

export default class Movie extends ScaffoldModelBase {
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

  belongsToMany(models: Models): BelongsToManyResult[] {
    return [{ target: models.Actor, options: { through: "ActorMovies" } }]
  }
}