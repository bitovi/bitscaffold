import { BitScaffoldModel, BitScaffoldSchema } from "../types"
import { Sequelize, DataTypes } from "sequelize"

export function buildModels(schema: BitScaffoldSchema): Sequelize {
    const sequelize = new Sequelize('sqlite::memory:');

    Object.keys(schema.models).forEach((modelName) => {
        const model: BitScaffoldModel = schema.models[modelName];
        sequelize.define(modelName, {}, {});
    })


    return sequelize;
}

export function listModels() {

}



