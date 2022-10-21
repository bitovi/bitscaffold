import { DataTypes } from "sequelize";
import {
  BelongsToResult,
  LoadedModels,
  ScaffoldAttributes,
  ScaffoldModelBase,
} from "../../../types";

export default class Bar extends ScaffoldModelBase {
  attributes(): ScaffoldAttributes {
    return {
      name: DataTypes.STRING,
    };
  }

  belongsTo(models: LoadedModels): BelongsToResult[] {
    return [{ target: models.Foo }];
  }
}
