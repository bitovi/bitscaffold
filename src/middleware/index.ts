import Koa, { Middleware } from "koa";
import compose from "koa-compose";
import { FindOptions, IncludeOptions } from "sequelize";
import { v4 } from "uuid";
import { Signale } from "signale";

import { ScaffoldModelContext, ScaffoldContext } from "../types";

export function scaffoldLoggingMiddleware() {
  return async function scaffoldLogging(ctx: Koa.Context, next: Koa.Next) {
    ctx.state.uuid = v4();
    ctx.state.logger = new Signale({ scope: ctx.state.uuid });

    ctx.set("x-koa-uuid", ctx.state.uuid);
    await next();
  };
}

export function scaffoldErrorHandlerMiddleware() {
  return async function scaffoldErrorHandler(ctx: Koa.Context, next: Koa.Next) {
    return next().catch((err) => {
      ctx.type = "json";

      ctx.status = err.statusCode || 500;
      ctx.body = {
        errors: [err.message],
        data: null,
        meta: err,
      };

      if (ctx.state.logger) {
        ctx.state.logger.error(err.message, err);
      }

      ctx.app.emit("error", err, ctx);
    });
  };
}

export function stateDefaultsMiddleware(state = {}) {
  return async function stateDefaults(ctx, next) {
    ctx.state.logger.info("stateDefaults input", state);
    ctx.state = Object.assign(ctx.state, state);
    ctx.state.logger.info("stateDefaults output", ctx.state);
    await next();
  };
}

export function paramsDefaultsMiddleware(params = {}) {
  return async function paramsDefaults(ctx, next) {
    ctx.state.logger.info("paramsDefaults input", params);
    ctx.params = Object.assign(ctx.params, params);
    ctx.state.logger.info("paramsDefaults output", ctx.params);
    await next();
  };
}

export function scaffoldValidationMiddleware(): Middleware {
  return async function scaffoldValidation(
    ctx: ScaffoldModelContext,
    next: Koa.Next
  ) {
    ctx.state.logger.pending("scaffoldValidation", ctx.state.model.name);

    const invalid: string[] = [];
    if (ctx.request.body) {
      const attributes = Object.keys(ctx.state.model.getAttributes());
      const associations = Object.keys(ctx.state.model.associations);
      Object.keys(ctx.request.body).forEach((key) => {
        if (!attributes.includes(key)) {
          if (!associations.includes(key)) {
            invalid.push(key);
          }
        }
      });
    }

    if (invalid.length > 0) {
      ctx.throw(
        400,
        "Invalid properties found for " +
          ctx.state.model.name +
          ": " +
          invalid.join(",")
      );
    }

    if (!ctx.validation) {
      ctx.state.logger.warn("scaffoldValidation no validation on context");
      return await next();
    }

    const name = ctx.state.model.name;
    if (ctx.validation[name]) {
      ctx.state.logger.info(
        "scaffoldValidation",
        "found validation rules for",
        ctx.state.model.name
      );
    }

    // Perform some lookups for the model
    // Perform some lookusp for the validation
    ctx.state.logger.success("scaffoldValidation", ctx.state.model.name);
    await next();
  };
}

export function scaffoldFindAllMiddleware(): Middleware {
  return async function scaffoldFindAll(
    ctx: ScaffoldModelContext,
    next: Koa.Next
  ) {
    ctx.state.logger.pending("scaffoldFindAllMiddleware", ctx.state.model.name);

    if (!ctx.state.model) {
      ctx.state.logger.error("scaffoldFindAllMiddleware, No Model On Context");
      return ctx.throw(500, "No Model On Context");
    }

    const options: FindOptions = { include: [] };

    Object.keys(ctx.state.model.associations).forEach((name) => {
      const association = ctx.state.model.associations[name];
      if (Array.isArray(options.include)) {
        options.include.push({
          model: association.target,
          as: association.as,
        });
      }
    });

    // options.include = {
    //   model: ctx.state.model.associations[ctx.query.include].target,
    //   as: ctx.query.include,
    // };
    //}

    // Perform some lookups for the model
    const result = await ctx.state.model.findAll(options);

    // Attach the results to the Koa context body
    ctx.state.body = result || [];
    ctx.state.status = 200;
    ctx.state.logger.success("scaffoldFindAllMiddleware", ctx.state.model.name);
    await next();
  };
}

export function scaffoldFindOneMiddleware(): Middleware {
  return async function scaffoldFindOne(
    ctx: ScaffoldModelContext,
    next: Koa.Next
  ) {
    ctx.state.logger.pending("scaffoldFindOneMiddleware", ctx.state.model.name);

    if (!ctx.state.model) {
      ctx.state.logger.error("scaffoldFindAllMiddleware, No Model On Context");
      return ctx.throw(500, "No Model On Context");
    }

    const options: Omit<FindOptions, "where"> = {};

    if (ctx.query && ctx.query.include) {
      ctx.state.logger.info("Include:", ctx.query.include);

      if (Array.isArray(ctx.query.include)) {
        return ctx.throw(500, "Cannot (currently) include multiple models!");
      }

      if (!ctx.state.models[ctx.query.include]) {
        return ctx.throw(500, "No Model To Include");
      }

      options.include = ctx.query.include;
    }

    // Perform some findOne database query
    const result = await ctx.state.model.findByPk(ctx.params.id, options);

    if (!result) {
      ctx.throw(404, "ID " + ctx.params.id + " Not Found");
    }

    // Attach the results to the Koa context body
    ctx.state.body = result;
    ctx.state.status = 200;
    ctx.state.logger.success("scaffoldFindOneMiddleware", ctx.state.model.name);
    await next();
  };
}

export function scaffoldCreateMiddleware(): Middleware {
  return async function scaffoldCreate(
    ctx: ScaffoldModelContext,
    next: Koa.Next
  ) {
    ctx.state.logger.pending("scaffoldCreateMiddleware", ctx.state.model.name);

    if (!ctx.state.model) {
      ctx.state.logger.error("scaffoldCreateMiddleware, No Model On Context");
      return ctx.throw(500, "No Model On Context");
    }

    // https://sequelize.org/docs/v6/advanced-association-concepts/creating-with-associations/

    // Create the `create` options based on the incoming request and the model properties
    const include: IncludeOptions[] = [];
    Object.keys(ctx.state.model.associations).forEach((name) => {
      // Check if this key is found on the request body. If it is, include that as an association
      // so that we can cascade the create call
      if (ctx.request.body[name]) {
        // This needs to reference the Alias that we used to create the model.
        // This is probably discoverable via the model itself...
        ctx.state.logger.info("Adding create association for ", name);
        include.push({
          association: ctx.state.model.associations[name],
          as: ctx.state.model.associations[name].as,
        });
      }
    });

    // Attempt to validate before create
    try {
      const temp = ctx.state.model.build(ctx.request.body);
      await temp.validate();
    } catch (err) {
      ctx.throw(400, err);
    }

    // Perform some create database query
    try {
      const result = await ctx.state.model.create(ctx.request.body, {
        include,
      });

      // Attach the results to the Koa context body
      ctx.state.body = result;
      ctx.state.status = 201;
    } catch (err) {
      ctx.throw(500, err.message);
    }
    ctx.state.logger.success("scaffoldCreateMiddleware", ctx.state.model.name);
    await next();
  };
}

export function scaffoldDeleteMiddleware(): Middleware {
  return async function scaffoldDelete(
    ctx: ScaffoldModelContext,
    next: Koa.Next
  ) {
    ctx.state.logger.pending("scaffoldDeleteMiddleware", ctx.state.model.name);

    if (!ctx.state.model) {
      ctx.state.logger.error("scaffoldDeleteMiddleware, No Model On Context");
      return ctx.throw(500, "No Model On Context");
    }

    // Perform some delete database query
    try {
      const result = await ctx.state.model.destroy({
        where: {
          id: ctx.params.id,
        },
      });

      // Attach the results to the Koa context body
      ctx.state.body = result;
      ctx.state.status = 200;
    } catch (err) {
      ctx.throw(500, err.message);
    }
    ctx.state.logger.success("scaffoldDeleteMiddleware", ctx.state.model.name);
    await next();
  };
}

export function scaffoldUpdateMiddleware(): Middleware {
  return async function scaffoldUpdate(
    ctx: ScaffoldModelContext,
    next: Koa.Next
  ) {
    ctx.state.logger.pending("scaffoldUpdateMiddleware", ctx.state.model.name);

    if (!ctx.state.model) {
      ctx.state.logger.error("scaffoldUpdateMiddleware, No Model On Context");
      return ctx.throw(500, "No Model On Context");
    }

    // Check that this is a valid update first
    // @TODO: This might be really slow....?
    try {
      const record = await ctx.state.model.findByPk(ctx.params.id);
      if (!record) {
        ctx.state.logger.error("scaffoldUpdateMiddleware, Record Not Found");
        return ctx.throw(404, "Record Not Found");
      }

      record.set(ctx.request.body);
      await record.validate();
    } catch (err) {
      ctx.state.logger.error(
        "scaffoldUpdateMiddleware, Record Validation Failed"
      );
      return ctx.throw(400, err);
    }

    // Perform some update database query
    try {
      const [result] = await ctx.state.model.update(ctx.request.body, {
        where: {
          id: ctx.params.id,
        },
      });

      // Attach the results to the Koa context body
      ctx.state.body = result;
      ctx.state.status = 200;
    } catch (err) {
      ctx.state.logger.error("scaffoldUpdateMiddleware, Record Update Failed");
      return ctx.throw(500, err.message);
    }
    ctx.state.logger.success("scaffoldUpdateMiddleware", ctx.state.model.name);
    await next();
  };
}

export function scaffoldAuthorizationMiddleware(): Middleware {
  return async function scaffoldAuthorization(
    ctx: ScaffoldModelContext,
    next: Koa.Next
  ) {
    ctx.state.logger.pending("scaffoldAuthorizationMiddleware");
    // Perform some authorization checks
    if (!ctx.headers.authorization) {
      ctx.throw(401, "No Auth Header");
    }
    ctx.state.logger.info(
      "scaffoldAuthorizationMiddleware token was",
      ctx.headers.authorization
    );

    ctx.state.logger.success("scaffoldAuthorizationMiddleware");
    await next();
  };
}

export function scaffoldFindModelMiddleware(override?: string): Middleware {
  return async function scaffoldFindModel(
    ctx: ScaffoldContext,
    next: Koa.Next
  ) {
    ctx.state.logger.pending("scaffoldFindModelMiddleware", ctx.params.model);

    let modelName = ctx.params.model;
    if (override) {
      modelName = override;
    }

    if (!ctx.state.models[modelName]) {
      ctx.state.logger.error("scaffoldFindModelMiddleware", modelName);

      ctx.throw(404, "Unknown Model Name '" + modelName + "'");
    }

    ctx.state.logger.info("Attached Model:", modelName);
    // Look at the available models, the route, and attach the model to the state
    ctx.state.model = ctx.state.models[modelName];
    ctx.state.logger.success("scaffoldFindModelMiddleware", modelName);
    await next();
  };
}

export function scaffoldAPIResponseMiddleware(): Middleware {
  return async function scaffoldAPIResponse(ctx: ScaffoldContext) {
    ctx.state.logger.pending("scaffoldAPIResponseMiddleware");

    if (!ctx.state.body) {
      ctx.throw("Bad Middleware Order");
    }

    ctx.body = {
      errors: [],
      data: ctx.state.body,
      meta: null,
    };

    if (ctx.state.status) {
      ctx.status = ctx.state.status;
    }

    ctx.state.logger.success("scaffoldAPIResponseMiddleware");
  };
}

export function scaffoldCreateDefaultMiddleware(): Middleware {
  return compose([
    scaffoldAuthorizationMiddleware(),
    scaffoldFindModelMiddleware(),
    scaffoldValidationMiddleware(),
    scaffoldCreateMiddleware(),
    scaffoldAPIResponseMiddleware(),
  ]);
}

export function scaffoldDeleteDefaultMiddleware(): Middleware {
  return compose([
    scaffoldAuthorizationMiddleware(),
    scaffoldFindModelMiddleware(),
    scaffoldDeleteMiddleware(),
    scaffoldAPIResponseMiddleware(),
  ]);
}

export function scaffoldUpdateDefaultMiddleware(): Middleware {
  return compose([
    scaffoldAuthorizationMiddleware(),
    scaffoldFindModelMiddleware(),
    scaffoldValidationMiddleware(),
    scaffoldUpdateMiddleware(),
    scaffoldAPIResponseMiddleware(),
  ]);
}

export function scaffoldFindOneDefaultMiddleware(): Middleware {
  return compose([
    scaffoldAuthorizationMiddleware(),
    scaffoldFindModelMiddleware(),
    scaffoldFindOneMiddleware(),
    scaffoldAPIResponseMiddleware(),
  ]);
}

export function scaffoldFindAllDefaultMiddleware(): Middleware {
  return compose([
    scaffoldAuthorizationMiddleware(),
    scaffoldFindModelMiddleware(),
    scaffoldFindAllMiddleware(),
    scaffoldAPIResponseMiddleware(),
  ]);
}
