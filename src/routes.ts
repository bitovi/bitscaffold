import Router from "@koa/router";
import Koa from "koa"
import signale from "signale"
import {
    scaffoldFindAllMiddleware,
    scaffoldFindAllDefaultMiddleware,
    scaffoldFindOneDefaultMiddleware,
    scaffoldCreateDefaultMiddleware,
    scaffoldValidationMiddleware,
    scaffoldFindModelMiddleware
} from "./middleware";

export async function buildRoutes(app): Promise<Koa> {
    const router = new Router();
    /**
     * A generated, or maybe user defined, route for the 'test' model
     * provides a custom middleware to do something special, but then 
     * falls back to the internal scaffold provided middleware
     */
    router.get('/api/UserOverride',
        async (ctx, next) => {
            // do something special for test auth here!
            signale.info("Special User Override Auth Middleware");
            await next()
        },
        scaffoldFindModelMiddleware('Example'),
        scaffoldValidationMiddleware(), // built in, used by the default handlers
        scaffoldFindAllMiddleware() // built in, used by the default handler
    )

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
    * could provide sane defaults for authorization, validation, findAll behavior
    */
    router.get('/api/:model', scaffoldFindAllDefaultMiddleware());

    /**
    * A wildcard route for any passed in model, the middleware function here
    * could provide sane defaults for authorization, validation, create behavior
    */
    router.post('/api/:model', scaffoldCreateDefaultMiddleware());

    app.use(router.routes());
    app.use(router.allowedMethods());
    return app;
}