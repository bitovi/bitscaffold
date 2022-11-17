import Koa from "koa";
import { Scaffold } from "..";
import { ScaffoldFunctionExportsMiddleware } from "../types";

export function buildMiddlewareForModel(
  scaffold: Scaffold,
  modelName: string
): ScaffoldFunctionExportsMiddleware {
  return {
    findAll: findAllMiddleware(scaffold, modelName),
    findOne: findOneMiddleware(scaffold, modelName),
    findAndCountAll: findAndCountAllMiddleware(scaffold, modelName),
    create: createMiddleware(scaffold, modelName),
    destroy: destroyMiddleware(scaffold, modelName),
    update: updateMiddleware(scaffold, modelName),
  };
}

export function findAllMiddleware(scaffold: Scaffold, modelName: string) {
  return async function findAllImpl(ctx: Koa.Context) {
    ctx.body = await scaffold.everything[modelName].findAll(ctx.query);
  };
}

export function findOneMiddleware(scaffold: Scaffold, modelName: string) {
  return async function findOneImpl(ctx: Koa.Context) {
    ctx.body = await scaffold.everything[modelName].findOne(
      ctx.query,
      ctx.params.id
    );
  };
}

export function findAndCountAllMiddleware(
  scaffold: Scaffold,
  modelName: string
) {
  return async function findAndCountAllImpl(ctx: Koa.Context) {
    ctx.body = await scaffold.everything[modelName].findAndCountAll(ctx.query);
  };
}

export function createMiddleware(scaffold: Scaffold, modelName: string) {
  return async function createImpl(ctx: Koa.Context) {
    ctx.body = await scaffold.everything[modelName].create(ctx);
  };
}

export function updateMiddleware(scaffold: Scaffold, modelName: string) {
  return async function updateImpl(ctx: Koa.Context) {
    ctx.body = await scaffold.everything[modelName].update(ctx);
  };
}

export function destroyMiddleware(scaffold: Scaffold, modelName: string) {
  return async function destroyImpl(ctx: Koa.Context) {
    ctx.body = await scaffold.everything[modelName].destroy(ctx.query);
  };
}
