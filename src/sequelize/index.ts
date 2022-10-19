import Koa from "koa";
import { Sequelize } from "sequelize"
import signale from "signale";
import { ScaffoldModel } from "@scaffold/types"

export async function prepareSequelize(app: Koa): Promise<any> {
    if (!app.context.database) {
        const sequelize = new Sequelize('sqlite::memory:', {
            logging: (message) => {
                signale.info("  SQL:", message)
            },
        });

        app.context.database = sequelize;
        return sequelize;
    }
}

export async function prepareModels(app: Koa, models: ScaffoldModel[]): Promise<any> {
    if (!app.context.database) {
        await prepareSequelize(app);
    }

    const sequelize = app.context.database;
    models.forEach((model) => {
        model.initModel(sequelize);
    });

    models.forEach((model) => {
        model.initAssociations(sequelize);
    });
}
