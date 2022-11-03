import { DataTypes, ModelAttributes, Sequelize, Model, ModelCtor } from "@sequelize/core";
const sequelize = new Sequelize("sqlite::memory:");

// Stripped down type, attributes maps directly to Sequelize
interface ScaffoldModel {
    name: string;
    attributes: ModelAttributes<Model>;
}

interface ScaffoldTestInterface {
    id: number;
    name: string;
    integerProperty: number;
    stringProperty: string
}

type ScaffoldTestInterfaceCreate = Omit<ScaffoldTestInterface, 'id'>


const attributes: ModelAttributes<Model<ScaffoldTestInterface, ScaffoldTestInterfaceCreate>> = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    integerProperty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    stringProperty: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
};

// Scaffold way of defining a Sequelize Model (stripped down)
const ScaffoldTestSchema: ScaffoldModel = {
    name: "Team",
    attributes: attributes,
};

// Register our model with Sequelize, it ends up attached to sequelize.models.*
const ScaffoldTest: ModelCtor<Model<ScaffoldTestInterface>> = sequelize.define(
    ScaffoldTestSchema.name,
    ScaffoldTestSchema.attributes
);

// This works, if I tell it this thing is a ScaffoldTest
const test = {
    name: "test",
    badProperty: "test",
    stringProperty: "good",
    integerProperty: 1,
};

const record = ScaffoldTest.create(test);
console.log(record);


// How do I tell findAll that it has those properties available?
ScaffoldTest.findAll({
    // I would like this to also tell me what attributes are valid...
    where: {
        badProperty: "test",
        integerProperty: 1
    }
}).then((result) => {
    console.log(result);
})