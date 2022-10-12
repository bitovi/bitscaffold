
import Koa, { Middleware } from "koa";
import compose from 'koa-compose';
import { FindOptions } from "sequelize";
import { ScaffoldModelContext, ScaffoldContext } from "../types";

export function scaffoldValidationMiddleware(): Middleware {
    return async function scaffoldValidation(ctx: ScaffoldModelContext, next: Koa.Next) {
        ctx.state.logger.pending('scaffoldValidation', ctx.state.model.name);

        const name = ctx.state.model.name;
        if (ctx.validation[name]) {
            ctx.state.logger.info('scaffoldValidation', 'found validation rules for', ctx.state.model.name);
        }

        // Perform some lookups for the model
        // Perform some lookusp for the validation
        ctx.state.logger.success('scaffoldValidation', ctx.state.model.name);
        await next()
    }
}

export function scaffoldFindAllMiddleware(): Middleware {
    return async function scaffoldFindAll(ctx: ScaffoldModelContext, next: Koa.Next) {
        ctx.state.logger.pending('scaffoldFindAllMiddleware', ctx.state.model.name);

        if (!ctx.state.model) {
            ctx.state.logger.error('scaffoldFindAllMiddleware, No Model On Context');
            return ctx.throw(500, "No Model On Context")
        }

        const options: FindOptions = {};

        if (ctx.query && ctx.query.include) {
            ctx.state.logger.info("Include:", ctx.query.include);

            if (Array.isArray(ctx.query.include)) {
                return ctx.throw(500, "Cannot (currently) include multiple models!");
            }

            if (!ctx.models[ctx.query.include]) {
                return ctx.throw(500, "No Model To Include")
            }

            options.include = ctx.query.include;
        }

        // Perform some lookups for the model
        const result = await ctx.state.model.findAll(options);

        // Attach the results to the Koa context body
        ctx.body = result || [];
        ctx.status = 200;
        ctx.state.logger.success('scaffoldFindAllMiddleware', ctx.state.model.name);
    }
}

export function scaffoldFindOneMiddleware(): Middleware {
    return async function scaffoldFindOne(ctx: ScaffoldModelContext, next: Koa.Next) {
        ctx.state.logger.pending('scaffoldFindOneMiddleware', ctx.state.model.name);

        if (!ctx.state.model) {
            ctx.state.logger.error('scaffoldFindAllMiddleware, No Model On Context');
            return ctx.throw(500, "No Model On Context")
        }

        const options: Omit<FindOptions<any>, "where"> = {};

        if (ctx.query && ctx.query.include) {
            ctx.state.logger.info("Include:", ctx.query.include);

            if (Array.isArray(ctx.query.include)) {
                return ctx.throw(500, "Cannot (currently) include multiple models!");
            }

            if (!ctx.models[ctx.query.include]) {
                return ctx.throw(500, "No Model To Include")
            }

            options.include = ctx.query.include;
        }

        // Perform some findOne database query
        const result = await ctx.state.model.findByPk(ctx.params.id, options);

        if (!result) {
            ctx.throw(404, "ID " + ctx.params.id + " Not Found")
        }

        // Attach the results to the Koa context body
        ctx.body = result;
        ctx.status = 200;
        ctx.state.logger.success('scaffoldFindOneMiddleware', ctx.state.model.name);
    }
}

export function scaffoldCreateMiddleware(): Middleware {
    return async function scaffoldCreate(ctx: ScaffoldModelContext, next: Koa.Next) {
        ctx.state.logger.pending('scaffoldCreateMiddleware', ctx.state.model.name);

        if (!ctx.state.model) {
            ctx.state.logger.error('scaffoldCreateMiddleware, No Model On Context');
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
        ctx.state.logger.success('scaffoldCreateMiddleware', ctx.state.model.name);
        await next();
    }
}

export function scaffoldAuthorizationMiddleware(): Middleware {
    return async function scaffoldAuthorization(ctx: ScaffoldModelContext, next: Koa.Next) {
        ctx.state.logger.pending('scaffoldAuthorizationMiddleware');

        // Perform some lookups for the model options
        // Perform some authorization checks
        ctx.state.logger.success('scaffoldAuthorizationMiddleware');
        await next()
    }
}

export function scaffoldFindModelMiddleware(override?: string): Middleware {
    return async function scaffoldFindModel(ctx: ScaffoldContext, next: Koa.Next) {
        ctx.state.logger.pending('scaffoldFindModelMiddleware', ctx.params.model);

        let modelName = ctx.params.model;
        if (override) {
            modelName = override;
        }

        if (!ctx.models[modelName]) {
            ctx.state.logger.error('scaffoldFindModelMiddleware', modelName);

            ctx.throw(404, "Unknown Model Name '" + modelName + "'");
        }

        ctx.state.logger.info("Attached Model:", modelName)
        // Look at the available models, the route, and attach the model to the state
        ctx.state.model = ctx.models[modelName]
        ctx.state.logger.success('scaffoldFindModelMiddleware', modelName);
        await next()
    }
}

export function scaffoldCreateDefaultMiddleware(): Middleware {
    return compose([
        scaffoldAuthorizationMiddleware(),
        scaffoldFindModelMiddleware(),
        scaffoldValidationMiddleware(),
        scaffoldCreateMiddleware()
    ])
}

export function scaffoldFindOneDefaultMiddleware(): Middleware {
    return compose([
        scaffoldAuthorizationMiddleware(),
        scaffoldFindModelMiddleware(),
        scaffoldFindOneMiddleware()
    ])
}

export function scaffoldFindAllDefaultMiddleware(): Middleware {
    return compose([
        scaffoldAuthorizationMiddleware(),
        scaffoldFindModelMiddleware(),
        scaffoldFindAllMiddleware()
    ])
}