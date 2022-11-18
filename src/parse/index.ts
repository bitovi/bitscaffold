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
  create: (body: unknown, query: ParsedUrlQuery) => Promise<CreateOptions>;
  update: (
    body: unknown,
    query: ParsedUrlQuery,
    id?: Identifier
  ) => Promise<UpdateOptions>;
  destroy: (query: ParsedUrlQuery, id?: Identifier) => Promise<DestroyOptions>;
}

export function buildParserForModel(
  scaffold: Scaffold,
  modelName: string
): ParseFunctions {
  return {
    findAll: async (query) => {
      return {
        attributes: buildAttributeList(query),
        where: buildWhereClause(query),
      };
    },
    findOne: async (query, id) => {
      return {
        attributes: buildAttributeList(query),
        where: buildWhereClause(query, id),
      };
    },
    findAndCountAll: async (query) => {
      return {
        attributes: buildAttributeList(query),
        where: buildWhereClause(query),
      };
    },
    create: async (body, query) => {
      return {};
    },
    destroy: async (query, id) => {
      return {
        where: buildWhereClause(query, id),
      };
    },
    update: async (body, query, id) => {
      return {
        where: buildWhereClause(query, id),
      };
    },
  };
}
