import { DataTypes } from "sequelize";
import { ScaffoldModel } from "../../../types";

export const Bar: ScaffoldModel = {
  attributes: {
    name: DataTypes.STRING,
  },
  belongsTo(models) {
    return [{ target: models.Foo }];
  },
};
