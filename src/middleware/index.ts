import Koa from "koa";
import { Scaffold } from "..";
import { KoaMiddleware, ExpressMiddleware } from "../types";
import { parseScaffoldBody } from "../parse/body";

/**
 * Provides a set of exported functions, per Model, that
 * provide Koa Middleware for each operation
 */
export interface MiddlewareFunctionsKoa {
  findAll: KoaMiddleware;
  findOne: KoaMiddleware;
  findAndCountAll: KoaMiddleware;
  create: KoaMiddleware;
  update: KoaMiddleware;
  destroy: KoaMiddleware;
  frontend: KoaMiddleware;
  schema: KoaMiddleware;
  crud: KoaMiddleware;
}

/**
 * Provides a set of exported functions, per Model, that
 * provide Express Middleware for each operation
 */
export interface MiddlewareFunctionsExpress {
  findAll: ExpressMiddleware;
  findOne: ExpressMiddleware;
  findAndCountAll: ExpressMiddleware;
  create: ExpressMiddleware;
  update: ExpressMiddleware;
  destroy: ExpressMiddleware;
}

export function buildMiddlewareForModel(
  scaffold: Scaffold,
  modelName: string
): MiddlewareFunctionsKoa {
  return {
    findAll: findAllMiddleware(scaffold, modelName),
    findOne: findOneMiddleware(scaffold, modelName),
    findAndCountAll: findAndCountAllMiddleware(scaffold, modelName),
    create: createMiddleware(scaffold, modelName),
    destroy: destroyMiddleware(scaffold, modelName),
    update: updateMiddleware(scaffold, modelName),
    frontend: async (ctx) => {
      ctx.throw(500, "Not Implemented");
    },
    schema: async (ctx) => {
      ctx.throw(500, "Not Implemented");
    },
    crud: async (ctx) => {
      ctx.throw(500, "Not Implemented");
    },
  };
}

export function findAllMiddleware(scaffold: Scaffold, modelName: string) {
  return async function findAllImpl(ctx: Koa.Context) {
    // If this is a wildcard or allModel situation, figure out the model from the route
    if (modelName === "*") {
      modelName = resolveWildcard(scaffold, ctx.path);
    }

    ctx.body = await scaffold.everything[modelName].findAll(ctx.query);
  };
}

export function findOneMiddleware(scaffold: Scaffold, modelName: string) {
  return async function findOneImpl(ctx: Koa.Context) {
    const params = scaffold.getScaffoldURLParamsForRoute(ctx.path);
    if (!params.id) {
      return ctx.throw(400, "BAD_REQUEST");
    }

    // If this is a wildcard or allModel situation, figure out the model from the route
    if (modelName === "*") {
      if (!params.model) {
        return ctx.throw(400, "BAD_REQUEST");
      }

      modelName = params.model;
    }

    ctx.body = await scaffold.everything[modelName].findOne(
      ctx.query,
      params.id
    );
  };
}

export function findAndCountAllMiddleware(
  scaffold: Scaffold,
  modelName: string
) {
  return async function findAndCountAllImpl(ctx: Koa.Context) {
    // If this is a wildcard or allModel situation, figure out the model from the route
    if (modelName === "*") {
      modelName = resolveWildcard(scaffold, ctx.path);
    }

    ctx.body = await scaffold.everything[modelName].findAndCountAll(ctx.query);
  };
}

export function createMiddleware(scaffold: Scaffold, modelName: string) {
  return async function createImpl(ctx: Koa.Context) {
    // If this is a wildcard or allModel situation, figure out the model from the route
    if (modelName === "*") {
      modelName = resolveWildcard(scaffold, ctx.path);
    }

    const body = await parseScaffoldBody(ctx, ctx.request.type);
    ctx.body = await scaffold.everything[modelName].create(body, ctx.query);
  };
}

export function updateMiddleware(scaffold: Scaffold, modelName: string) {
  return async function updateImpl(ctx: Koa.Context) {
    // If this is a wildcard or allModel situation, figure out the model from the route
    if (modelName === "*") {
      modelName = resolveWildcard(scaffold, ctx.path);
    }

    const body = await parseScaffoldBody(ctx, ctx.request.type);
    const params = scaffold.getScaffoldURLParamsForRoute(ctx.path);
    ctx.body = await scaffold.everything[modelName].update(
      body,
      ctx.query,
      params.id
    );
  };
}

export function destroyMiddleware(scaffold: Scaffold, modelName: string) {
  return async function destroyImpl(ctx: Koa.Context) {
    // If this is a wildcard or allModel situation, figure out the model from the route
    if (modelName === "*") {
      modelName = resolveWildcard(scaffold, ctx.path);
    }

    const params = scaffold.getScaffoldURLParamsForRoute(ctx.path);
    ctx.body = await scaffold.everything[modelName].destroy(
      ctx.query,
      params.id
    );
  };
}

function resolveWildcard(scaffold, path): string {
  const params = scaffold.getScaffoldURLParamsForRoute(path);
  if (!params.model) {
    throw scaffold.createError({ code: "400", title: "Invalid URL Format: " });
  }
  return params.model;
}
