import { DataTypes } from "sequelize";
import { ScaffoldModel } from "../../../types";

export const Foo: ScaffoldModel = {
  name: "Foo",
  attributes: {
    name: DataTypes.STRING,
  },
  hasOne: [
    { target: "Bar", options: { as: "Bar" } },
    { target: "Bar", options: { as: "Baz" } },
  ],
};
