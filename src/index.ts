import { Koa } from "koa";
import { Router } from "@koa/router";
import { scaffoldFindAllMiddleware, scaffoldFindAllDefaultMiddleware, scaffoldFindOneDefaultMiddleware, scaffoldCreateDefaultMiddleware, scaffoldValidationMiddleware } from "./middleware";

const app = new Koa();
const router = new Router();

/**
 * A generated, or maybe user defined, route for the 'users' model
 * provides a custom middleware to do something special, but then 
 * falls back to the internal scaffold provided middleware
 */
router.get('/users',
    (ctx, next) => {
        // do something special for users auth here!
        next()
    },
    scaffoldValidationMiddleware, // built in, used by the default handlers
    scaffoldFindAllMiddleware // built in, used by the default handler
)

/**
 * A wildcard route for any passed in model, the middleware function here
 * could provide sane defaults for authorization, validation, findAll behavior
 */
router.get('/:model', scaffoldFindAllDefaultMiddleware);

/**
 * A wildcard route for any passed in model, the middleware function here
 * could provide sane defaults for authorization, validation, findOne behavior
 */
router.get('/:models/:id', scaffoldFindOneDefaultMiddleware);

/**
 * A wildcard route for any passed in model, the middleware function here
 * could provide sane defaults for authorization, validation, create behavior
 */
router.post('/:model', scaffoldCreateDefaultMiddleware);


app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);
