import Router from "@koa/router";
import Koa from "koa"
import { Model, ModelCtor, ModelStatic } from "sequelize-typescript";
import { Employee } from "./sequelize/models/Employee.model"
import signale from "signale"
import {
    scaffoldFindAllMiddleware,
    scaffoldFindAllDefaultMiddleware,
    scaffoldFindOneDefaultMiddleware,
    scaffoldCreateDefaultMiddleware,
    scaffoldValidationMiddleware,
    scaffoldFindModelMiddleware,
    scaffoldDeleteDefaultMiddleware,
    scaffoldUpdateDefaultMiddleware
} from "./middleware";
import { ScaffoldModelContext } from "./types";

export async function buildRoutes(app): Promise<Router> {
    const router: Router = new Router();
    /**
     * A meta endpoint to display the list of loaded models known to Scaffold
     */
    router.get('/meta/models',
        async (ctx, next) => {
            ctx.body = Object.keys(ctx.models);
            await next()
        },
    )

    /**
    * A wildcard route for any passed in model, the middleware function here
    * could provide sane defaults for authorization, validation, findOne behavior
    */
    router.get('/api/:model/:id', scaffoldFindOneDefaultMiddleware());

    /**
    * A wildcard route for any passed in model, the middleware function here
    * could provide sane defaults for authorization, validation, update behavior
    */
    router.put('/api/:model/:id', scaffoldUpdateDefaultMiddleware());

    /**
    * A wildcard route for any passed in model, the middleware function here
    * could provide sane defaults for authorization, validation, delete behavior
    */
    router.del('/api/:model/:id', scaffoldDeleteDefaultMiddleware());

    /**
    * A wildcard route for any passed in model, the middleware function here
    * could provide sane defaults for authorization, validation, findAll behavior
    */
    router.get('/api/:model', scaffoldFindAllDefaultMiddleware());

    /**
    * A wildcard route for any passed in model, the middleware function here
    * could provide sane defaults for authorization, validation, create behavior
    */
    router.post('/api/:model', scaffoldCreateDefaultMiddleware());
    return router;
}