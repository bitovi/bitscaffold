import Koa, { Middleware } from "koa";
import KoaBodyParser from "koa-body";
import Router from "@koa/router";
import { Signale } from "signale";
import KoaCors from "@koa/cors";
import { v4 } from "uuid";
import os from "os";
import { prepareDefaultRoutes } from "./routes";
import { ScaffoldApplication, ScaffoldModel } from "./types";
import { prepareModels, prepareSequelize } from "./sequelize";

/**
 * Entrypoint
 */
export async function createScaffoldApplication(models: ScaffoldModel[], routes?: Router): Promise<ScaffoldApplication> {
    const app = new Koa();
    await prepareKoaApplication(app);
    await prepareSequelize(app);
    await prepareModels(app, models)

    if (routes) {
        app.use(routes.routes())
        app.use(routes.allowedMethods())
    }

    const router = await prepareDefaultRoutes();
    app.use(router.routes());
    app.use(router.allowedMethods())

    return app;
}

export async function startScaffoldApplication(app: ScaffoldApplication, port?: number): Promise<void> {
    await app.listen(port || 3000);
}

export function attachScaffoldDefaultMiddleware(models: ScaffoldModel[], app: Koa): Middleware {
    const setup = async () => {
        await prepareKoaApplication(app);
        await prepareSequelize(app);
        await prepareModels(app, models)
    }
    setup();
    return async function attachScaffoldDefault(ctx, next) {
        await next();
    }
}

async function prepareKoaApplication(app: Koa) {
    if (!app.context.bitscaffold) {
        // Check if this koa app has already been processed
        app.context.bitscaffold = true;

        // Hook up cors
        app.use(KoaCors({ origin: "*" }));

        // Enable the body parser for relevant methods
        app.use(KoaBodyParser({
            parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
            multipart: true,
            includeUnparsed: true,
            formidable: { multiples: true, uploadDir: os.tmpdir() },
        }))

        // Attach some debugging uuid information to 
        // state, logging, and response headers
        app.use(async (ctx: Koa.Context, next: Koa.Next) => {
            ctx.state.uuid = v4();
            ctx.state.logger = new Signale({ scope: ctx.state.uuid });

            ctx.set('x-koa-uuid', ctx.state.uuid);
            await next();
        });
    }
}