import { ScaffoldModel, DataTypes } from "../../../types";

export const Player: ScaffoldModel = {
  name: "Player",
  attributes: {
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
  belongsTo: [{ target: "Team" }],
};

export const Team: ScaffoldModel = {
  name: "Team",
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
  },
  hasMany: [{ target: "Player", options: { as: "players" } }],
};
