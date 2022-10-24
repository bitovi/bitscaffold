import { ScaffoldModel, DataTypes } from "../../../types";

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
  belongsToMany: [{ target: "Movie", options: { through: "ActorMovies" } }],
};
