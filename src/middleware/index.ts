
import Koa from "koa";
import compose from 'koa-compose';
import signale from "signale";

export const scaffoldValidationMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    // Perform some lookups for the model
    // Perform some lookusp for the validation
    await next()
}

export const scaffoldFindAllMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    console.log('scaffoldFindAllMiddleware', ctx.state.model.name);

    if (!ctx.state.model) {
        console.log('scaffoldFindAllMiddleware', ctx.state.model.name);
        return ctx.throw(500, "No Model On Context")
    }

    // Perform some lookups for the model
    const result = await ctx.state.model.findAll();

    // Attach the results to the Koa context body
    ctx.body = result || [];
    ctx.status = 200;
    console.log('scaffoldFindAllMiddleware', ctx.state.model.name);
}

export const scaffoldFindOneMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    console.log('scaffoldFindOneMiddleware', ctx.state.model.name);

    if (!ctx.state.model) {
        console.log('scaffoldFindAllMiddleware', ctx.state.model.name);
        return ctx.throw(500, "No Model On Context")
    }

    // Perform some findOne database query
    const result = await ctx.state.model.findByPk(ctx.params.id);

    if (!result) {
        ctx.throw(404, "ID " + ctx.params.id + " Not Found")
    }

    // Attach the results to the Koa context body
    ctx.body = result;
    ctx.status = 200;
    console.log('scaffoldFindOneMiddleware', ctx.state.model.name);
}

export const scaffoldCreateMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    console.log('scaffoldCreateMiddleware', ctx.state.model.name);

    if (!ctx.state.model) {
        console.log('scaffoldFindAllMiddleware', ctx.state.model.name);
        return ctx.throw(500, "No Model On Context")
    }

    // Perform some create database query
    try {
        const result = await ctx.state.model.create(ctx.request.body);

        // Attach the results to the Koa context body
        ctx.body = result;
        ctx.status = 201;
    } catch (err) {
        ctx.throw(500, err.message);
    }
    console.log('scaffoldCreateMiddleware', ctx.state.model.name);
    await next();
}

export const scaffoldAuthorizationMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    console.log('scaffoldAuthorizationMiddleware');

    // Perform some lookups for the model options
    // Perform some authorization checks
    console.log('scaffoldAuthorizationMiddleware');
    await next()
}

export const scaffoldFindModelMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    console.log('scaffoldFindModelMiddleware', ctx.params.model);

    if (!ctx.models[ctx.params.model]) {
        console.log('scaffoldFindModelMiddleware', ctx.params.model);

        ctx.throw(404, "Unknown Model Name '" + ctx.params.model + "'");
    }

    console.log("Attached Model:", ctx.params.model)
    // Look at the available models, the route, and attach the model to the state
    ctx.state.model = ctx.models[ctx.params.model]
    console.log('scaffoldFindModelMiddleware', ctx.params.model);
    await next()
}

export const scaffoldCreateDefaultMiddleware = compose([
    async (ctx: Koa.Context, next: Koa.Next) => {
        console.log('compose scaffoldCreateDefaultMiddleware');
        await next();
        console.log('compose scaffoldCreateDefaultMiddleware');
    },
    scaffoldAuthorizationMiddleware,
    scaffoldValidationMiddleware,
    scaffoldFindModelMiddleware,
    scaffoldCreateMiddleware
]);

export const scaffoldFindOneDefaultMiddleware = compose([
    async (ctx: Koa.Context, next: Koa.Next) => {
        console.log('compose scaffoldFindOneDefaultMiddleware');
        await next();
        console.log('compose scaffoldFindOneDefaultMiddleware');
    },
    scaffoldAuthorizationMiddleware,
    scaffoldValidationMiddleware,
    scaffoldFindModelMiddleware,
    scaffoldFindOneMiddleware
]);

export const scaffoldFindAllDefaultMiddleware = compose([
    async (ctx: Koa.Context, next: Koa.Next) => {
        console.log('compose scaffoldFindAllDefaultMiddleware');
        await next();
        console.log('compose scaffoldFindAllDefaultMiddleware');
    },
    scaffoldAuthorizationMiddleware,
    scaffoldValidationMiddleware,
    scaffoldFindModelMiddleware,
    scaffoldFindAllMiddleware
]);