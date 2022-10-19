import Koa, { Middleware } from "koa"
import { database, setup } from ".";
import { buildRoutes } from "./routes";
import { v4 } from "uuid"
import signale, { Signale } from "signale";
import { Model, ModelCtor } from "sequelize-typescript";


async function singleton(models, app) {
    if (!app.context.bitscaffold) {
        app.context.bitscaffold = true;

        signale.info("Running Setup")
        app = await setup(app);

        signale.info("Attaching Routes")
        app = await buildRoutes(app)

        signale.info("Running database setup")
        await database(app, models);

        signale.info("Running validation setup");
    }
}

// Re-export middleware at the top level
export * from "./middleware";
export * from "./index"

export function BitScaffoldMiddleware(models: ModelCtor<Model<any, any>>[], app: Koa): Middleware {
    // Set up the whole application and attach it to the provided Koa application
    singleton(models, app);

    return async function BitScaffold(ctx: Koa.Context, next: Koa.Next) {
        if (!ctx.bitscaffold) {
            ctx.throw(500, "BitScaffold Not Ready");
        }

        ctx.state.uuid = v4();
        ctx.state.logger = new Signale({ scope: ctx.state.uuid });

        ctx.set('x-koa-uuid', ctx.state.uuid);

        await next();
    }
}
