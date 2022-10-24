import { DataTypes } from "sequelize";
import { ScaffoldModel } from "../../../types";

export const Bar: ScaffoldModel = {
  name: "Bar",
  attributes: {
    name: DataTypes.STRING,
  },
  belongsTo: [{ target: "Foo" }],
};
