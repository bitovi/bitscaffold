import { ScaffoldModel, DataTypes } from "../../../types";

export const Team: ScaffoldModel = {
  name: "Team",
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  hasMany: [{ target: "Player", options: { as: "players" } }],
};
