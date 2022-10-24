import { ScaffoldModel, DataTypes } from "../../../types";

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
  belongsToMany: [{ target: "Actor", options: { through: "ActorMovies" } }],
};
