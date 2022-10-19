import Koa from "koa";
import KoaBodyParser from "koa-body";
import Router from "@koa/router";
import signale, { Signale } from "signale";
import { buildValidation, loadModels } from "./sequelize"
import { buildRoutes } from "./routes";
import { BitScaffoldSchema } from "./types";
import { readSchemaFile, parseSchemaFile } from "./schema-parser/json"
import KoaCors from "@koa/cors";
import { v4 } from "uuid";
import os from "os";
import { Model, ModelCtor } from "sequelize-typescript";

/**
 * Creates a Koa server and attaches the default configuration middleware
 * @returns Koa
 */
export async function setup(app?: Koa): Promise<Koa> {
    if (!app) {
        app = new Koa();
    }

    // app.on('error', (err, ctx) => {
    //     err.expose = true;
    // });

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
    })

    return app;
}

/**
 * Starts the Koa instance listening on port 3000
 * resolves when the service has started
 * 
 * @param app Koa Instance
 * @returns Koa Instance
 */
export async function start(app: Koa): Promise<Koa> {
    return new Promise((resolve) => {
        app.listen(3000, () => { resolve(app) });
    })
}

/**
 * Takes the Schema and builds the ORM models, attaching them
 * to the Koa Context for the rest of the application to use
 * 
 * @param app Koa Instance
 * @param schema Schema JSON
 * @returns Koa Instance
 */
export async function database(app: Koa, models: ModelCtor<Model<any, any>>[]): Promise<Koa> {
    const sequelize = await loadModels(models);

    app.context.database = sequelize;
    app.context.models = sequelize.models;
    return app;
}

/**
 * Takes the Schema and builds the validation rules, attaching them
 * to the Koa Context for the rest of the application to use
 * 
 * @param app Koa Instance
 * @param schema Schema JSON
 * @returns Koa Instance
 */
export async function validation(app: Koa, schema: BitScaffoldSchema): Promise<Koa> {
    const rules = await buildValidation(schema);
    app.context.validation = rules;
    return app;
}


/**
 * Loads the schema file, parses it, and returns the 
 * validated Schema JSON contents
 * 
 * @returns Schema JSON
 */
export async function loadSchema(config: string) {
    const result = await readSchemaFile(config);
    const schema = await parseSchemaFile(result);
    return schema;
}

/**
 * Entrypoint
 */
export async function init(models: ModelCtor<Model<any, any>>[], externalRoutes?: Router): Promise<Koa<Koa.DefaultState, Koa.DefaultContext>> {
    signale.info("Running setup")
    const app = await setup();

    if (externalRoutes) {
        app.use(externalRoutes.routes());
        app.use(externalRoutes.allowedMethods());
    }

    const router = await buildRoutes(app)
    app.use(router.routes());
    app.use(router.allowedMethods());

    signale.info("Running database setup")
    await database(app, models);

    return app;
}