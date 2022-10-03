
import Koa from "koa";
import compose from 'koa-compose';
import signale from "signale";

export const scaffoldValidationMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    // Perform some lookups for the model
    // Perform some lookusp for the validation
    await next()
}

export const scaffoldFindAllMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    signale.pending('scaffoldFindAllMiddleware', ctx.state.model.name);

    if (!ctx.state.model) {
        signale.error('scaffoldFindAllMiddleware', ctx.state.model.name);
        return ctx.throw(500, "No Model On Context")
    }

    // Perform some lookups for the model
    const result = await ctx.state.model.findAll();

    // Attach the results to the Koa context body
    ctx.body = result || [];
    ctx.status = 200;
    signale.success('scaffoldFindAllMiddleware', ctx.state.model.name);
}

export const scaffoldFindOneMiddleware = async (ctx) => {
    signale.pending('scaffoldFindOneMiddleware', ctx.state.model.name);

    if (!ctx.state.model) {
        signale.error('scaffoldFindAllMiddleware', ctx.state.model.name);
        return ctx.throw(500, "No Model On Context")
    }

    // Perform some findOne database query
    const result = await ctx.state.model.findByPk(ctx.params.id);

    // Attach the results to the Koa context body
    ctx.body = result;
    ctx.status = 200;
    signale.success('scaffoldFindOneMiddleware', ctx.state.model.name);
}

export const scaffoldCreateMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    signale.pending('scaffoldCreateMiddleware', ctx.state.model.name);

    if (!ctx.state.model) {
        signale.error('scaffoldFindAllMiddleware', ctx.state.model.name);
        return ctx.throw(500, "No Model On Context")
    }

    // Perform some create database query
    const result = await ctx.state.model.create(ctx.request.body);

    // Attach the results to the Koa context body
    ctx.body = result.toJSON();
    ctx.status = 201;
    signale.success('scaffoldCreateMiddleware', ctx.state.model.name, ctx.body, ctx.status);
    await next();
}

export const scaffoldAuthorizationMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    signale.pending('scaffoldAuthorizationMiddleware');

    // Perform some lookups for the model options
    // Perform some authorization checks
    signale.success('scaffoldAuthorizationMiddleware');
    await next()
}

export const scaffoldFindModelMiddleware = async (ctx: Koa.Context, next: Koa.Next) => {
    signale.pending('scaffoldFindModelMiddleware', ctx.params.model);

    if (!ctx.models[ctx.params.model]) {
        signale.error('scaffoldFindModelMiddleware', ctx.params.model);

        ctx.throw(404, "Unknown Model - Not Found");
    }

    signale.debug("Attached Model:", ctx.params.model)
    // Look at the available models, the route, and attach the model to the state
    ctx.state.model = ctx.models[ctx.params.model]
    signale.success('scaffoldFindModelMiddleware', ctx.params.model);
    await next()
}

export const scaffoldCreateDefaultMiddleware = compose([
    async (ctx: Koa.Context, next: Koa.Next) => {
        signale.pending('compose scaffoldCreateDefaultMiddleware');
        await next();
        signale.success('compose scaffoldCreateDefaultMiddleware');
    },
    scaffoldAuthorizationMiddleware,
    scaffoldValidationMiddleware,
    scaffoldFindModelMiddleware,
    scaffoldCreateMiddleware
]);

export const scaffoldFindOneDefaultMiddleware = compose([
    async (ctx: Koa.Context, next: Koa.Next) => {
        signale.pending('compose scaffoldFindOneDefaultMiddleware');
        await next();
        signale.success('compose scaffoldFindOneDefaultMiddleware');
    },
    scaffoldAuthorizationMiddleware,
    scaffoldValidationMiddleware,
    scaffoldFindModelMiddleware,
    scaffoldFindOneMiddleware
]);

export const scaffoldFindAllDefaultMiddleware = compose([
    async (ctx: Koa.Context, next: Koa.Next) => {
        signale.pending('compose scaffoldFindAllDefaultMiddleware');
        await next();
        signale.success('compose scaffoldFindAllDefaultMiddleware');
    },
    scaffoldAuthorizationMiddleware,
    scaffoldValidationMiddleware,
    scaffoldFindModelMiddleware,
    scaffoldFindAllMiddleware
]);