import { Scaffold } from "../../exports";
import Koa from "koa";
import signale from "signale";

import { App, User, Host } from "./models";
import { Model, FindOptions } from "sequelize";

export async function createDashboardAppInstance() {
    // Create a basic Koa application
    const app = new Koa();

    // Create a Scaffold instance containing your Models
    const scaffold = new Scaffold([User, App, Host], {
        prefix: "/api",
        database: {
            dialect: 'oracle'
        }
    });

    scaffold.model.App.beforeFind('calc-healthy-hosts-before', (options: FindOptions<any>) => {
        // Do something here to check if the user wants healthy hosts
        if (options.attributes) {
            const fields = Object.keys(options.attributes)
            if (fields.includes('hosts')) {
                // Add to the FindOptions to do the join in the hosts
                if (!options.include) {
                    options.include = [];
                }

                if (!Array.isArray(options.include)) {
                    options.include = [options.include]
                }

                if (options.include)
                    options.include.push()
            }
        }
    })
    scaffold.model.App.afterFind('calc-healthy-hosts-after', (instance: Model<{ hosts }>, options) => {
        // Do something to check the host status and calculate numbers based on that
        if (instance.getDataValue('hosts')) {

        }
    })

    // Set up your Koa app as normal, for example, a logging middleware
    app.use(async (ctx, next) => {
        signale.info("Incoming Request: ", ctx.method, ctx.path);
        await next();
    });

    // Attach the Scaffold default middleware to your Koa application
    app.use(scaffold.middleware.allModels.findAll);
    app.use(scaffold.middleware.allModels.findOne);

    app.listen(3000, () => {
        console.log("Scaffold Started");
    });
}

createDashboardAppInstance()