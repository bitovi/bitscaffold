import Koa from "koa";
import Router from "@koa/router";
import KoaBodyParser from "koa-body";
import { scaffoldFindAllMiddleware, scaffoldFindAllDefaultMiddleware, scaffoldFindOneDefaultMiddleware, scaffoldCreateDefaultMiddleware, scaffoldValidationMiddleware } from "./middleware";
import signale from "signale";
import { buildModels } from "./sequelize"
import { BitScaffoldSchema } from "./types";
import { readSchemaFile, parseSchemaFile } from "./schema-parser/json"

async function setup(): Promise<Koa> {
    const app = new Koa();
    const router = new Router();

    app.use(KoaBodyParser())
    app.use(async (ctx: Koa.Context, next: Koa.Next) => {
        signale.info("Incoming Request Start");
        await next();
    })

    /**
     * A generated, or maybe user defined, route for the 'users' model
     * provides a custom middleware to do something special, but then 
     * falls back to the internal scaffold provided middleware
     */
    router.get('/api/test',
        async (ctx, next) => {
            // do something special for users auth here!
            await next()
        },
        scaffoldValidationMiddleware, // built in, used by the default handlers
        scaffoldFindAllMiddleware // built in, used by the default handler
    )

    /**
     * A generated, or maybe user defined, route for the 'users' model
     * provides a custom middleware to do something special, but then 
     * falls back to the internal scaffold provided middleware
     */
    router.get('/meta/models',
        async (ctx, next) => {
            ctx.body = Object.keys(ctx.models);
            await next()
        },
    )

    /**
    * A wildcard route for any passed in model, the middleware function here
    * could provide sane defaults for authorization, validation, findAll behavior
    */
    router.get('/api/:model', scaffoldFindAllDefaultMiddleware);

    /**
    * A wildcard route for any passed in model, the middleware function here
    * could provide sane defaults for authorization, validation, findOne behavior
    */
    router.get('/api/:models/:id', scaffoldFindOneDefaultMiddleware);

    /**
    * A wildcard route for any passed in model, the middleware function here
    * could provide sane defaults for authorization, validation, create behavior
    */
    router.post('/api/:model', scaffoldCreateDefaultMiddleware);


    app.use(router.routes());
    app.use(router.allowedMethods());

    return app;
}

async function start(app: Koa): Promise<Koa> {
    return new Promise((resolve) => {
        app.listen(3000, () => { resolve(app) });
    })
}

async function database(app: Koa, schema: BitScaffoldSchema): Promise<Koa> {
    const sequelize = await buildModels(schema);
    console.log("All models were synchronized successfully.");

    app.context.database = sequelize;
    app.context.models = sequelize.models;
    return app;
}

async function loadSchema() {
    const result = await readSchemaFile('test/fixtures/test-json-schema/schema.bitscaffold');
    const schema = await parseSchemaFile(result);
    return schema;
}

async function init() {
    signale.info("Running setup")
    const app = await setup();
    signale.info("Running load schema")
    const schema = await loadSchema();

    signale.info("Running datbase setup")
    await database(app, schema);

    signale.info("Running start service")
    await start(app);
}

init();