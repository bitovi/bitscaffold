import Koa from "koa";
import KoaBodyParser from "koa-body";
import signale, { Signale } from "signale";
import { buildModels, buildValidation } from "./sequelize"
import { buildRoutes } from "./routes";
import { BitScaffoldSchema } from "./types";
import { readSchemaFile, parseSchemaFile } from "./schema-parser/json"
import KoaCors from "@koa/cors";
import { v4 } from "uuid";
import os from "os";

/**
 * Creates a Koa server and attaches the default configuration middleware
 * @returns Koa
 */
async function setup(): Promise<Koa> {
    const app = new Koa();

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
async function start(app: Koa): Promise<Koa> {
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
async function database(app: Koa, schema: BitScaffoldSchema): Promise<Koa> {
    const sequelize = await buildModels(schema);

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
async function validation(app: Koa, schema: BitScaffoldSchema): Promise<Koa> {
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
async function loadSchema() {
    const result = await readSchemaFile('test/fixtures/test-json-schema/schema.bitscaffold');
    const schema = await parseSchemaFile(result);
    return schema;
}

/**
 * Entrypoint
 */
async function init() {
    signale.info("Running setup")
    let app = await setup();
    app = await buildRoutes(app)


    signale.info("Running load schema")
    const schema = await loadSchema();

    signale.info("Running database setup")
    await database(app, schema);

    signale.info("Running validation setup");
    await validation(app, schema);

    signale.info("Running start service")
    await start(app);
}

init();