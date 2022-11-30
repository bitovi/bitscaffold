import { ScaffoldModel, DataTypes } from "../../../types";

export const Employee: ScaffoldModel = {
  name: "Employee",
  attributes: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    age: {
      type: DataTypes.INTEGER,
      validate: {
        min: 18
      }
    }
  },
  validation: {
    startDateBeforeEndDate() {
      if (this.start_date && this.end_date && this.start_date < this.end_date) {
        throw new Error("START_DATE_MUST_BE_BEFORE_END_DATE");
      }
    },
    endDateAfterStartDate() {
      if (
        this.start_date &&
        this.end_date &&
        this.start_date >= this.end_date
      ) {
        throw new Error("START_DATE_MUST_BE_BEFORE_END_DATE");
      }
    },
  },
  belongsToMany: [
    { target: "Role", options: { through: "role__employee", as: "roles" } },
  ],
};

/*
-- public.employee definition

-- Drop table

-- DROP TABLE employee;

CREATE TABLE employee (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" varchar(255) NOT NULL,
    start_date date NULL,
    end_date date NULL,
    CONSTRAINT employee_pkey PRIMARY KEY (id)
);
*/
