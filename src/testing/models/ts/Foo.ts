import { DataTypes, Model, ModelAttributes } from "sequelize";
import {
  HasOneResult,
  LoadedModels,
  ScaffoldModelBase,
  ScaffoldAttributes,
} from "../../../types";

export default class Foo extends ScaffoldModelBase {
  attributes(): ScaffoldAttributes {
    return {
      name: DataTypes.STRING,
    };
  }

  hasOne(models: LoadedModels): HasOneResult[] {
    return [
      { target: models.Bar, options: { as: "Bar" } },
      { target: models.Bar, options: { as: "Baz" } },
    ];
  }
}
