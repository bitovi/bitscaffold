import { DataTypes } from "sequelize";
import { ScaffoldModel } from "../../../types";

export const Foo: ScaffoldModel = {
  attributes: {
    name: DataTypes.STRING,
  },

  hasOne(models) {
    return [
      { target: models.Bar, options: { as: "Bar" } },
      { target: models.Bar, options: { as: "Baz" } },
    ];
  },
};
