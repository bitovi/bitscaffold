import {
  DataTypes,
  ModelAttributes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

interface ScaffoldModel {
  attributes: ModelAttributes;
  name: string;
}

export const Skill: ScaffoldModel = {
  name: "Skill",
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
      unique: true,
    },
  },
};

const sequelize = new Sequelize("sqlite::memory:", {
  logging: false,
});

class Employee1 extends Model<
  InferAttributes<Employee1>,
  InferCreationAttributes<Employee1>
> {
  declare firstName: string;
  declare lastName: string;
  declare id: CreationOptional<string>;
}

Employee1.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: sequelize }
);

// const result3 = await Employee1.create({
//   firstName: "Mark",
//   lastName: "Repka",
//   badProp: true,
// });
// console.log(result3);

// function pickObjectKeys<T, K extends keyof T>(obj: T, keys: K[]) {
//   const result = {} as Pick<T, K>;
//   for (const key of keys) {
//     if (key in obj) {
//       result[key] = obj[key];
//     }
//   }
//   return result;
// }

// const language = {
//   name: "TypeScript",
//   age: 8,
//   extensions: ["ts", "tsx"],
// };

// const ageAndExtensions = pickObjectKeys(language, ["age", "extensions"]);
// console.log(ageAndExtensions);
