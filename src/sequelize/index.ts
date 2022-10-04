import { BitScaffoldModel, BitScaffoldSchema } from "../types"
import { Sequelize, DataTypes, ModelAttributes, Model } from "sequelize"
import signale from "signale";

export async function buildModels(schema: BitScaffoldSchema): Promise<Sequelize> {
    const sequelize = new Sequelize('sqlite::memory:', {
        logging: (message) => {
            signale.info("  SQL:", message)
        }
    });

    Object.keys(schema.models).forEach((modelName) => {
        const model: any = schema.models[modelName];
        signale.info("Creating Model: ", modelName);
        sequelize.define(modelName, model, { createdAt: false, updatedAt: false });
    })

    signale.info("Starting Model Sync");
    await sequelize.sync({ force: true });
    signale.info("Finished Model Sync");

    return sequelize;
}
