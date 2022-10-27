// Library Functions
import Koa, { Middleware } from "koa";
import Router from "@koa/router";
import { Model, ModelStatic, Sequelize } from "sequelize";
import signale from "signale";
import { ScaffoldModel } from "../types";
import { prepareModels, prepareSequelize } from "../sequelize";

function buildKoa(options) {
    const koa = new Koa();
    // This could do more to set some defaults or read options
    return koa;
}

export async function Scaffold(models: ScaffoldModel[], options: any) {
    const app = buildKoa(options);
    await prepareSequelize(app);
    await prepareModels(app, models);

    app.context.routes = {};
    app.context.router = new Router();

    return {
        makeScaffoldDefaults: makeScaffoldDefaults(app, models),
        makeScaffoldCRUD: makeScaffoldCRUD(app, models),
        makeScaffoldFindAll: makeScaffoldFindAll(app, models),
        makeScaffoldFindOne: makeScaffoldFindOne(app, models),
        makeScaffoldDeleteOne: makeScaffoldDeleteOne(app, models),
        makeScaffoldUpdateOne: makeScaffoldUpdateOne(app, models),
        listen: listen(app, options)
    }
}

function listen(app: Koa, options: any) {
    return async function handler() {
        await app.listen(options.port || 3000);
        console.log("Scaffold is listening on port ", options.port || 3000)
    }
}

function makeScaffoldDefaults(app: Koa, models: ScaffoldModel[]) {
    const makeScaffoldCRUDInstance = makeScaffoldCRUD(app, models);
    return async function handler() {
        for (const model of models) {
            await makeScaffoldCRUDInstance(model, {});
        }
    }
}

interface ScaffoldCRUDOverride {
    findAll?: Middleware
    findOne?: Middleware

}


function makeScaffoldCRUD(app: Koa, models: ScaffoldModel[]) {
    return async function handler(model: ScaffoldModel, overrides: ScaffoldCRUDOverride) {

        if (overrides.findAll) {

        } else {
            await (makeScaffoldFindAll(app, models))(model);
        }


        await (makeScaffoldFindOne(app, models))(model);
        await (makeScaffoldDeleteOne(app, models))(model);
        await (makeScaffoldUpdateOne(app, models))(model);
    }
}

function makeScaffoldFindAll(app: Koa, models: ScaffoldModel[]) {
    return async function FindAllHandler(_: ScaffoldModel, middleware?: Middleware) {
        // Come up with some way to handle route 'collision' if the user defines a route
        // and then calls the default handler after.... 
        const router: Router = app.context.router;
        const model: ModelStatic<Model> = app.context.database.models[_.name];

        if (middleware) {
            console.log("Created a FindAllHandler using provided middleware for", model.name);
        }

        if (!middleware) {
            console.log("Created a FindAllHandler for", model.name);
            middleware = async (ctx, next) => {
                ctx.body = await model.findAll()
                ctx.status = 200;
                await next();
            }
        }

        router.get('/api/' + model.name, middleware);
    }
}

function makeScaffoldFindOne(app: Koa, models: ScaffoldModel[]) {
    return async function FindOneHandler(model: ScaffoldModel) {
        console.log("Created a FindOneHandler for", model.name);
    }
}

function makeScaffoldDeleteOne(app: Koa, models: ScaffoldModel[]) {
    return async function DeleteOneHandler(model: ScaffoldModel,) {
        console.log("Created a DeleteOneHandler for", model.name);
    }
}

function makeScaffoldUpdateOne(app: Koa, models: ScaffoldModel[]) {
    return async function UpdateOneHandler(model: ScaffoldModel) {
        console.log("Created a UpdateOneHandler for", model.name);
    }
}