// Library Functions
import Koa, { Middleware } from "koa";
import Router from "@koa/router";
import { FindOptions, Model, ModelStatic, Sequelize } from "sequelize";
import { ScaffoldModel } from "../types";
import KoaBodyParser from "koa-body";
import signale, { Signale } from "signale";
import KoaCors from "@koa/cors";
import { v4 } from "uuid";
import os from "os";
import { prepareModels, prepareSequelize } from "../sequelize";

interface ScaffoldOptions {
    port: number
}

export class Scaffold {
    private initialized: Promise<void>;
    private options: ScaffoldOptions;
    private models: ScaffoldModel[];
    private sequelize: Sequelize;
    private server: Koa;
    private router: Router;
    private routes: { [routeKey: string]: boolean };
    private finalized: boolean;

    constructor(models: ScaffoldModel[], options: ScaffoldOptions) {
        this.options = options;
        this.models = models;
        this.server = this.buildKoaApplication();
        this.router = new Router();
        this.routes = {};
        this.finalized = false;
        this.sequelize = prepareSequelize(this.server, true)

        this.server.context.database = this.sequelize;

        this.initialized = new Promise<void>((resolve) => {
            prepareModels(this.server, models).then(() => {
                resolve();
            })
        });
    }

    async makeScaffoldDefaults() {
        await this.initialized;

        for (const model of this.models) {
            await this.makeDefaultRoutes(model);
        }
    }

    async finalize(): Promise<void> {
        await this.initialized;

        signale.pending("finalize");
        this.server.use(this.router.routes());
        this.server.use(this.router.allowedMethods());
        signale.success("finalize");
    }

    async listen(): Promise<void> {
        await this.initialized;
        await this.server.listen(this.options.port || 3000);
        signale.info("Server Started, Listening on Port", this.options.port || 3000)
    }

    async makeDefaultRoutes(model: ScaffoldModel) {
        await this.initialized;
        await this.routeFindAll(model);
        await this.routeFindOne(model);
        await this.routeUpdate(model);
        await this.routeCreate(model);
        await this.routeDelete(model);
    }

    async routeFindAll(sm: ScaffoldModel, middleware?: Middleware) {
        await this.initialized;
        const model = this.resolveSequelizeModel(sm);

        if (middleware) {
            signale.info("Creating override 'findAll' route for", model.name);
        }

        if (!middleware) {
            signale.info("Creating default 'findAll' route for", model.name);
            middleware = async (ctx, next) => {
                ctx.body = await this.ormFindAll(sm, ctx.state.findOptions);
                ctx.status = 200;
                await next();
            }
        }

        this.registerRoute('get', '/api/' + model.name, middleware);
    }

    async ormFindAll(sm: ScaffoldModel, options: FindOptions): Promise<Model<any, any>[]> {
        await this.initialized;
        const model = this.resolveSequelizeModel(sm);

        const result = await model.findAll(options);
        return result;
    }

    async routeFindOne(sm: ScaffoldModel, middleware?: Middleware | Middleware[]) {
        await this.initialized;
        const model = this.resolveSequelizeModel(sm);

        if (middleware) {
            signale.info("Creating override 'findOne' route for", model.name);
        }

        if (!middleware) {
            signale.info("Creating default 'findOne' route for", model.name);
            middleware = async (ctx, next) => {
                ctx.body = await this.ormFindOne(sm, ctx.params.id, ctx.params);
                ctx.status = 200;
                await next();
            }
        }
        this.registerRoute('get', '/api/' + model.name + "/:id", middleware);
    }

    async ormFindOne(sm: ScaffoldModel, id: any, options: FindOptions): Promise<Model<any, any> | null> {
        await this.initialized;
        const model = this.resolveSequelizeModel(sm);

        if (id) {
            return await model.findByPk(id, options);
        }

        return await model.findOne(options);
    }


    async routeCreate(sm: ScaffoldModel, middleware?: Middleware) {
        await this.initialized;
        const model = this.resolveSequelizeModel(sm);

        if (middleware) {
            signale.info("Creating override 'create' route for", model.name);
        }

        if (!middleware) {
            signale.info("Creating default 'create' route for", model.name);
            middleware = async (ctx, next) => {
                ctx.body = await this.ormCreate(sm, ctx.request.body);
                ctx.status = 201;
                await next();
            }
        }

        this.registerRoute('post', '/api/' + model.name, middleware);
    }

    async ormCreate(sm: ScaffoldModel, body: any): Promise<Model<any, any>> {
        await this.initialized;
        const model = this.resolveSequelizeModel(sm);
        return await model.create(body);
    }

    async routeUpdate(sm: ScaffoldModel, middleware?: Middleware) {
        await this.initialized;
        const model = this.resolveSequelizeModel(sm);

        if (middleware) {
            signale.info("Creating override 'update' route for", model.name);
        }

        if (!middleware) {
            signale.info("Creating default 'update' route for", model.name);
            middleware = async (ctx, next) => {
                ctx.body = await this.ormUpdate(sm, ctx.request.body, ctx.params);
                ctx.status = 201;
                await next();
            }
        }

        this.registerRoute('put', '/api/' + model.name + "/:id", middleware);
    }

    async ormUpdate(sm: ScaffoldModel, clause: any, body: any): Promise<[affectedCount: number, affectedRows: Model<any, any>[]]> {
        await this.initialized;
        const model = this.resolveSequelizeModel(sm);
        return await model.update(body, clause);
    }

    async routeDelete(sm: ScaffoldModel, middleware?: Middleware) {
        await this.initialized;
        const model = this.resolveSequelizeModel(sm);

        if (middleware) {
            signale.info("Creating override 'delete' route for", model.name);
        }

        if (!middleware) {
            signale.info("Creating default 'delete' route for", model.name);
            middleware = async (ctx, next) => {
                ctx.body = await this.ormDelete(sm, ctx.body);
                ctx.status = 200;
                await next();
            }
        }

        this.registerRoute('delete', '/api/' + model.name + "/:id", middleware);
    }

    async ormDelete(sm: ScaffoldModel, clause: any): Promise<number> {
        await this.initialized;
        const model = this.resolveSequelizeModel(sm);
        return await model.destroy(clause);
    }

    resolveSequelizeModel(sm: ScaffoldModel): ModelStatic<Model> {
        if (!sm) {
            throw new Error("No Model Specified");
        }

        if (!sm.name) {
            throw new Error("No Model Name Specified");
        }

        if (!this.server.context.database) {
            throw new Error("No Sequelize Instance Available");
        }

        const sequelize = this.server.context.database;
        return sequelize.models[sm.name];
    }

    async get(path: string, handler: Middleware): Promise<void> {
        await this.initialized;
        this.registerRoute('get', path, handler);
    }

    async put(path: string, handler: Middleware): Promise<void> {
        await this.initialized;
        this.registerRoute('put', path, handler);
    }

    async delete(path: string, handler: Middleware): Promise<void> {
        await this.initialized;
        this.registerRoute('delete', path, handler);
    }

    async post(path: string, handler: Middleware): Promise<void> {
        await this.initialized;
        this.registerRoute('post', path, handler);
    }

    async patch(path: string, handler: Middleware): Promise<void> {
        await this.initialized;
        this.registerRoute('patch', path, handler);
    }

    private buildKoaApplication(): Koa {
        const app = new Koa();
        signale.info("Creating Koa Application Defaults");
        // Check if this koa app has already been processed
        app.context.bitscaffold = true;

        // Catch top level errors and format them correctly
        // app.use(ErrorHandler());

        // Hook up cors
        app.use(KoaCors({ origin: "*" }));

        // Enable the body parser for relevant methods
        app.use(
            KoaBodyParser({
                parsedMethods: ["POST", "PUT", "PATCH", "DELETE"],
                multipart: true,
                includeUnparsed: true,
                formidable: { multiples: true, uploadDir: os.tmpdir() },
            })
        );

        // Attach some debugging uuid information to
        // state, logging, and response headers
        app.use(async (ctx: Koa.Context, next: Koa.Next) => {
            ctx.state.uuid = v4();
            ctx.state.logger = new Signale({ scope: ctx.state.uuid });

            ctx.set("x-koa-uuid", ctx.state.uuid);
            await next();
        });

        return app;
    }

    private registerRoute(type: string, path: string, handler: Middleware | Middleware[]) {
        if (!this.router[type]) {
            throw new Error("Unknown route type requested" + type);
        }

        if (this.finalized) {
            throw new Error("Cannot add additional routes after Router is finalized");
        }

        if (this.routes[type + ":" + path]) {
            signale.warn("Found a second route registration attempt for", type, path);
        }

        if (!this.routes[type + ":" + path]) {
            this.routes[type + ":" + path] = true;
            this.router[type](path, handler);
        }
    }

}