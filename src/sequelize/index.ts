import { BitScaffoldModel, BitScaffoldSchema } from "../types"
import { Sequelize, DataTypes, ModelAttributes, Model } from "sequelize"

export async function buildModels(schema: BitScaffoldSchema): Promise<Sequelize> {
    const sequelize = new Sequelize('sqlite::memory:');

    Object.keys(schema.models).forEach((modelName) => {
        const model: any = schema.models[modelName];
        console.log("Creating Model: ", modelName);
        sequelize.define(modelName, model, { createdAt: false, updatedAt: false });
    })

    console.log("Starting Model Sync");
    await sequelize.sync({ force: true });
    console.log("Finished Model Sync");

    return sequelize;
}
