import { DataTypes, ModelValidateOptions } from "sequelize";
import {
  BelongsToResult,
  LoadedModels,
  ScaffoldModelBase,
  ScaffoldAttributes,
  HasManyResult,
} from "../../../types";


interface ScaffoldObj {
  attributes: ScaffoldAttributes,
  validation: ModelValidateOptions
}

export const PlayerObj: ScaffoldObj = {
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
  beforeInsert: (sequelize) => {
    
  }
}


export default class Player extends ScaffoldModelBase {

  declare id: number;

  attributes(): ScaffoldAttributes {
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
    };
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
      },
    };
  }

  belongsTo(models: LoadedModels): BelongsToResult[] {
    return [{ target: models.Team }];
  }
}



const test = new Player()