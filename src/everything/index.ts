import Koa from "koa";
import bodyParser from "co-body";
import { Scaffold } from "..";
import { Identifier } from "sequelize";
import { ParsedUrlQuery } from "querystring";
import { ScaffoldFunctionExportEverything } from "../types";

export function buildEverythingForModel(
  scaffold: Scaffold,
  modelName: string
): ScaffoldFunctionExportEverything {
  return {
    findAll: findAllEverything(scaffold, modelName),
    findOne: findOneEverything(scaffold, modelName),
    findAndCountAll: findAndCountAllEverything(scaffold, modelName),
    create: createEverything(scaffold, modelName),
    destroy: destroyEverything(scaffold, modelName),
    update: updateEverything(scaffold, modelName),
  };
}

export function findAllEverything(scaffold: Scaffold, modelName: string) {
  return async function findAllImpl(query: ParsedUrlQuery) {
    const params = await scaffold.parse[modelName].findAll(query);
    const result = await scaffold.model[modelName].findAll(params);
    const response = await scaffold.serialize[modelName].findAll(result);
    return response;
  };
}

export function findOneEverything(scaffold: Scaffold, modelName: string) {
  return async function findOneImpl(query: ParsedUrlQuery, id: Identifier) {
    const params = await scaffold.parse[modelName].findOne(query, id);
    const result = await scaffold.model[modelName].findByPk(id, params);
    const response = await scaffold.serialize[modelName].findOne(result);
    return response;
  };
}

export function findAndCountAllEverything(
  scaffold: Scaffold,
  modelName: string
) {
  return async function findAndCountAllImpl(query: ParsedUrlQuery) {
    const params = await scaffold.parse[modelName].findAndCountAll(query);
    const result = await scaffold.model[modelName].findAndCountAll(params);
    const response = await scaffold.serialize[modelName].findAndCountAll(
      result
    );
    return response;
  };
}

export function createEverything(scaffold: Scaffold, modelName: string) {
  return async function createImpl(ctx: Koa.Context) {
    const body = await bodyParser(ctx);
    const params = await scaffold.parse[modelName].create(body, ctx.query);
    const result = await scaffold.model[modelName].create(body, params);
    const response = await scaffold.serialize[modelName].create(result);
    return response;
  };
}

export function updateEverything(scaffold: Scaffold, modelName: string) {
  return async function updateImpl(ctx: Koa.Context, id: Identifier) {
    const body = await bodyParser(ctx);
    const params = await scaffold.parse[modelName].update(body, ctx.query, id);
    const result = await scaffold.model[modelName].update(body, params);
    const response = await scaffold.serialize[modelName].update(result);
    return response;
  };
}

export function destroyEverything(scaffold: Scaffold, modelName: string) {
  return async function destroyImpl(query: ParsedUrlQuery, id: Identifier) {
    const params = await scaffold.parse[modelName].destroy(query, id);
    const result = await scaffold.model[modelName].destroy(params);
    const response = await scaffold.serialize[modelName].destroy(result);
    return response;
  };
}
