import { ScaffoldModel, DataTypes } from "../../../types";

export const Bar: ScaffoldModel = {
  name: "Bar",
  attributes: {
    name: DataTypes.STRING,
  },
  belongsTo: [{ target: "Foo" }],
};
