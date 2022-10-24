import { DataTypes } from "sequelize";
import { ScaffoldModel } from "../../../types";

export const Movie: ScaffoldModel = {
  name: "Movie",
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
    return [{ target: models.Actor, options: { through: "ActorMovies" } }];
  },
};
