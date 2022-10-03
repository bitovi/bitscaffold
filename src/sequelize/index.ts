import { BitScaffoldModel, BitScaffoldSchema } from "../types"
import { Sequelize, DataTypes } from "sequelize"

export async function buildModels(schema: BitScaffoldSchema): Promise<Sequelize> {
    const sequelize = new Sequelize('sqlite::memory:');

    Object.keys(schema.models).forEach((modelName) => {
        const model: BitScaffoldModel = schema.models[modelName];
        console.log("Creating Model: ", modelName);
        sequelize.define(modelName, {}, {});
    })

    console.log("Starting Model Sync");
    await sequelize.sync({ force: true });
    console.log("Finished Model Sync");

    return sequelize;
}
