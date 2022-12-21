import { Scaffold } from "../../exports";
import Koa from "koa";
import signale from "signale";

import { App, User, Host } from "./models";

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