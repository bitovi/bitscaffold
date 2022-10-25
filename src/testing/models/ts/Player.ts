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
    firstName: {
      type: DataTypes.STRING,
      allowNull: false, // Make this a required field
      unique: 'fullName' // Together with lastName, become a composite unique key
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false, // Make this a required field
      unique: 'fullName' // Together with firstName, become a composite unique key
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW // Set the default date to the current time, if not specified
    },
    endDate: DataTypes.DATE,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      },
      unique: true // Each user must have a different email address, sure
    },
    customRegex: {
      type: DataTypes.STRING,
      validate: {
        is: /^[a-z]+$/i
      }
    },
    age: {
      type: DataTypes.INTEGER,
      validate: { // Clamp the values to a range, throw ValidationError if outside this
        min: 0,
        max: 150
      }
    }
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
