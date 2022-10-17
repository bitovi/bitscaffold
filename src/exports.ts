import Koa, { Middleware } from "koa"
import * as BitMiddleware from "./middleware";
import { database, init, setup, start, validation, loadSchema } from ".";
import { buildRoutes } from "./routes";
import { v4 } from "uuid"

import signale, { Signale } from "signale";

async function singleton(config, app) {
    if (!app.context.bitscaffold) {
        app.context.bitscaffold = true;

        signale.info("Running Setup")
        app = await setup(app);

        signale.info("Attaching Routes")
        app = await buildRoutes(app)

        signale.info("Running load schema")
        //const schema = await loadSchema(config);

        signale.info("Running database setup")
        //await database(app, schema);

        signale.info("Running validation setup");
        //await validation(app, schema);
    }
}


function BitScaffoldMiddleware(config: string, app: Koa): Middleware {
    // Set up the whole application and attach it to the provided Koa application
    singleton(config, app);

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


export { BitScaffoldMiddleware, BitMiddleware, database, init, setup, start, validation };