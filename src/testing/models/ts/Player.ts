import { DataTypes } from "sequelize";
import { BelongsToResult, LoadedModels, ScaffoldModel } from "../../../types";

export const Player: ScaffoldModel = {
  attributes: {
    id: {
      type: "INTEGER",
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  },
  validation: {
    startDateBeforeEndDate() {
      if (this.startDate && this.endDate && this.startDate >= this.endDate) {
        throw new Error("START_DATE_MUST_BE_BEFORE_END_DATE");
      }
    },
    endDateAfterStartDate() {
      if (this.startDate && this.endDate && this.startDate >= this.endDate) {
        throw new Error("START_DATE_MUST_BE_BEFORE_END_DATE");
      }
    },
  },
  belongsTo(models: LoadedModels): BelongsToResult[] {
    return [{ target: models.Team }];
  },
};
