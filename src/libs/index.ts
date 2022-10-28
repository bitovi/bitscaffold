// Library Functions
import signale from "signale";
import KoaBodyParser from "koa-body";

import { Middleware } from "koa";
import { Model, ModelStatic, Sequelize } from "sequelize";

import { ScaffoldModel } from "../types";
import { prepareModels, prepareSequelize } from "../sequelize";

function matchScaffoldRoute(routes: string[], path: string, method: string): boolean {
    const layers = routes;
    let layer;
    const matched = {
        path: [],
        pathAndMethod: [],
        route: false
    };

    for (let len = layers.length, i = 0; i < len; i++) {
        layer = layers[i];


        // eslint-disable-next-line unicorn/prefer-regexp-test
        if (layer.match(path)) {
            matched.path.push(layer);

            if (layer.methods.length === 0 || ~layer.methods.indexOf(method)) {
                matched.pathAndMethod.push(layer);
                if (layer.methods.length > 0) matched.route = true;
            }
        }
    }

    return matched;
}


export class Scaffold {
    private isInitialized: () => Promise<void>;
    private models: ScaffoldModel[];
    private sequelize: Sequelize;
    private routes: string[];
    private finalized: boolean;
    private prefix: string;
    private _initialized: Promise<void>;

    constructor(models: ScaffoldModel[], options: any) {
        this.models = models;
        this.finalized = false;
        this.sequelize = prepareSequelize();
        this.prefix = options.prefix || '/api/scaffold/';

        this._initialized = new Promise<void>((resolve) => {
            prepareModels(this.sequelize, models).then(() => {
                resolve();
            })
        });

        this.isInitialized = () => this._initialized;
    }

    defaults(): Middleware {
        const scaffold = this;
        return async function scaffoldDefaultMiddleware(ctx, next) {
            // Make sure that scaffold is ready...
            await scaffold.isInitialized();

            // Check if this path has the scaffold prefix
            if (!ctx.path.startsWith(scaffold.prefix)) {
                // This is not a scaffold route...
                return await next();
            }

            // Check if this path seems to reference a scaffold Model 
            const parts = ctx.path.replace(scaffold.prefix, '').split("/");
            if (!scaffold.sequelize.models[parts[0]]) {
                return await next();
            }

            const type = ctx.method;
            switch (type) {
                case "GET": {
                    return handleScaffoldGet(ctx, next);
                }
            }



            // Check if the incoming request is one we care about...
            await next();
        }
    }

    resolveSequelizeModel(sm: ScaffoldModel): ModelStatic<Model> {
        if (!sm) {
            throw new Error("No Model Specified");
        }

        if (!sm.name) {
            throw new Error("No Model Name Specified");
        }

        if (!this.sequelize.models[sm.name]) {
            throw new Error("Unknown Model Requested");
        }

        return this.sequelize.models[sm.name];
    }
}
