/* eslint-disable no-unused-vars */
import { Scaffold } from "..";
import { Identifier } from "sequelize";
import { JSONObject } from "../types";

export interface EverythingFunctions {
  findAll: (querystring: string) => Promise<JSONObject>;
  findOne: (querystring: string, id: Identifier) => Promise<JSONObject>;
  findAndCountAll: (query: string) => Promise<JSONObject>;
  create: (body: unknown, querystring: string) => Promise<JSONObject>;
  update: (
    body: unknown,
    querystring: string,
    id?: Identifier
  ) => Promise<JSONObject>;
  destroy: (querystring: string, id?: Identifier) => Promise<JSONObject>;
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
  return async function findAllImpl(querystring: string) {
    const params = await scaffold.parse[modelName].findAll(querystring);
    const result = await scaffold.model[modelName].findAll(params);
    const response = await scaffold.serialize[modelName].findAll(result, {
      keyForAttribute: "camelCase",
      attributes: params.attributes as string[],
    });
    return response;
  };
}

export function findOneEverything(scaffold: Scaffold, modelName: string) {
  return async function findOneImpl(querystring: string, id: Identifier) {
    const params = await scaffold.parse[modelName].findOne(querystring, id);
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
  return async function findAndCountAllImpl(querystring: string) {
    const params = await scaffold.parse[modelName].findAndCountAll(querystring);
    const result = await scaffold.model[modelName].findAndCountAll(params);
    const response = await scaffold.serialize[modelName].findAndCountAll(
      result
    );
    return response;
  };
}

export function createEverything(scaffold: Scaffold, modelName: string) {
  return async function createImpl(rawbody: unknown) {
    const { body, ops } = await scaffold.parse[modelName].create(rawbody);
    const result = await scaffold.model[modelName].create(body, ops);
    const response = await scaffold.serialize[modelName].create(result);
    return response;
  };
}

export function updateEverything(scaffold: Scaffold, modelName: string) {
  return async function updateImpl(
    rawbody: any,
    querystring: string,
    id?: Identifier
  ) {
    const { body, ops } = await scaffold.parse[modelName].update(rawbody, id);
    const result = await scaffold.model[modelName].update(body, ops);
    const response = await scaffold.serialize[modelName].update(result[0]);
    return response;
  };
}

export function destroyEverything(scaffold: Scaffold, modelName: string) {
  return async function destroyImpl(querystring: string, id: Identifier) {
    const params = await scaffold.parse[modelName].destroy(querystring, id);
    const result = await scaffold.model[modelName].destroy(params);
    const response = await scaffold.serialize[modelName].destroy(result);
    return response;
  };
}
