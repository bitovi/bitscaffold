import { DataTypes } from "sequelize";
import { ScaffoldModel } from "../../../types";

export const Actor: ScaffoldModel = {
  name: "Actor",
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
  },
  belongsToMany(models) {
    return [{ target: models.Movie, options: { through: "ActorMovies" } }];
  },
};
