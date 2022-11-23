/* eslint-disable no-unused-vars */
import { ParsedUrlQuery } from "node:querystring";
import {
  DestroyOptions,
  UpdateOptions,
  Identifier,
  CreateOptions,
  FindOptions,
} from "sequelize";
import { Scaffold } from "..";
import { buildAttributeList, buildWhereClause } from "./builder";
import { buildDeserializerForModel } from "../deserialize";
import { JSONObject } from "../types";

/**
 * Provides a set of exported functions, per Model, that
 * take information from the URL and parse it into a valid
 * Query options object
 */
export interface ParseFunctions {
  /**
   * Parses the parameters for the provided Model to prepare
   * the options needed for an ORM findAll query
   *
   * In most normal use cases this can come directly from the
   * Koa Context as `ctx.query`
   *
   */
  findAll: (query: ParsedUrlQuery) => Promise<FindOptions>;
  findOne: (query: ParsedUrlQuery, id: Identifier) => Promise<FindOptions>;
  findAndCountAll: (query: ParsedUrlQuery) => Promise<FindOptions>;
  create: (body: unknown) => Promise<{ body: JSONObject; ops: CreateOptions }>;
  update: (
    body: unknown,
    id?: Identifier
  ) => Promise<{ body: JSONObject; ops: UpdateOptions }>;
  destroy: (query: ParsedUrlQuery, id?: Identifier) => Promise<DestroyOptions>;
}

export function buildParserForModel(
  scaffold: Scaffold,
  modelName: string
): ParseFunctions {
  const deserializer = buildDeserializerForModel(scaffold, modelName);

  return {
    findAll: async (query) => {
      return {
        attributes: buildAttributeList(query, scaffold.model[modelName]),
        where: buildWhereClause(query),
      };
    },
    findOne: async (query, id) => {
      return {
        attributes: buildAttributeList(query, scaffold.model[modelName]),
        where: buildWhereClause(query, id),
      };
    },
    findAndCountAll: async (query) => {
      return {
        attributes: buildAttributeList(query, scaffold.model[modelName]),
        where: buildWhereClause(query),
      };
    },
    create: async (body: unknown) => {
      return {
        body: await deserializer.create(body, {}),
        ops: {},
      };
    },
    destroy: async (query, id) => {
      return {
        where: buildWhereClause(query, id),
      };
    },
    update: async (body, id) => {
      return {
        body: await deserializer.create(body, {}),
        ops: {
          where: buildWhereClause({}, id),
        },
      };
    },
  };
}
