import { BitScaffoldModel, BitScaffoldSchema } from "../types"
import { Sequelize, DataTypes } from "sequelize"

export async function buildModels(schema: BitScaffoldSchema): Promise<Sequelize> {
    const sequelize = new Sequelize('sqlite::memory:');

    Object.keys(schema.models).forEach((modelName) => {
        const model: BitScaffoldModel = schema.models[modelName];
        sequelize.define(modelName, {}, {});
    })

    return sequelize;
}
