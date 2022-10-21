import { DataTypes, Model, ModelAttributes, ModelValidateOptions } from "sequelize";
import { BelongsToResult, LoadedModels, ScaffoldModelBase } from "../../../types";

export default class Player extends ScaffoldModelBase {

  attributes(): ModelAttributes<Model<any, any>, any> {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
    }
  }

  validation(): ModelValidateOptions {
    return {
      startDateBeforeEndDate() {
        if (this.startDate && this.endDate && this.startDate >= this.endDate) {
          throw new Error("startDate must be before endDate");
        }
      },
      endDateAfterStartDate() {
        if (this.startDate && this.endDate && this.startDate >= this.endDate) {
          throw new Error("startDate must be before endDate");
        }
      }
    }
  }

  belongsTo(models: LoadedModels): BelongsToResult[] {
    return [{ target: models.Team }];
  }
}