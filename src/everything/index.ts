/* eslint-disable no-unused-vars */
import { Scaffold } from "..";
import { Identifier } from "sequelize";
import { ParsedUrlQuery } from "querystring";
import { JSONObject } from "../types";

export interface EverythingFunctions {
  findAll: (query: ParsedUrlQuery) => Promise<JSONObject>;
  findOne: (query: ParsedUrlQuery, id: Identifier) => Promise<JSONObject>;
  findAndCountAll: (query: ParsedUrlQuery) => Promise<JSONObject>;
  create: (body: unknown, query: ParsedUrlQuery) => Promise<JSONObject>;
  update: (
    body: unknown,
    query: ParsedUrlQuery,
    id?: Identifier
  ) => Promise<JSONObject>;
  destroy: (query: ParsedUrlQuery, id?: Identifier) => Promise<JSONObject>;
}

export function buildEverythingForModel(
  scaffold: Scaffold,
  modelName: string
): EverythingFunctions {
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
    const response = await scaffold.serialize[modelName].findAll(result, {
      keyForAttribute: "camelCase",
      attributes: params.attributes as string[],
    });
    return response;
  };
}

export function findOneEverything(scaffold: Scaffold, modelName: string) {
  return async function findOneImpl(query: ParsedUrlQuery, id: Identifier) {
    const params = await scaffold.parse[modelName].findOne(query, id);
    const result = await scaffold.model[modelName].findByPk(id, params);
    if (!result) {
      throw scaffold.createError({
        code: "404",
        title: "Not Found",
        detail: modelName + " with id " + id + " was not found",
      });
    }
    const response = await scaffold.serialize[modelName].findOne(result, {
      keyForAttribute: "camelCase",
      attributes: params.attributes as string[],
    });
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
  return async function createImpl(body: any, query: ParsedUrlQuery) {
    const body2 = await scaffold.deserialize[modelName].create(body);
    const params = await scaffold.parse[modelName].create(body2);
    const result = await scaffold.model[modelName].create(body2, params);
    const response = await scaffold.serialize[modelName].create(result);
    return response;
  };
}

export function updateEverything(scaffold: Scaffold, modelName: string) {
  return async function updateImpl(
    body: any,
    query: ParsedUrlQuery,
    id?: Identifier
  ) {
    const body2 = await scaffold.deserialize[modelName].create(body);
    const params = await scaffold.parse[modelName].update(body2, id);
    const result = await scaffold.model[modelName].update(body2, params);
    const response = await scaffold.serialize[modelName].update(result[0]);
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
