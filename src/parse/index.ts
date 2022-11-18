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
      let attributes: string[] = [];
      if (query.attributes) {
        if (!Array.isArray(query.attributes)) {
          attributes = [query.attributes];
        } else {
          attributes = query.attributes;
        }
      }

      if (!attributes.includes("id")) {
        attributes.push("id");
      }

      return {
        attributes: attributes,
      };
    },
    findOne: async (query, id) => {
      let attributes: string[] = [];
      if (query.attributes) {
        if (!Array.isArray(query.attributes)) {
          attributes = [query.attributes];
        } else {
          attributes = query.attributes;
        }
      }

      if (!attributes.includes("id")) {
        attributes.push("id");
      }

      return {
        attributes: attributes,
        where: {
          id: id,
        },
      };
    },
    findAndCountAll: async (query) => {
      return {};
    },
    create: async (body, query) => {
      return {};
    },
    destroy: async (query, id) => {
      const options: DestroyOptions = {};

      if (id) {
        options.where = {};
        options.where.id = id;
      }

      return options;
    },
    update: async (body, query, id) => {
      if (id) {
        return {
          where: {
            id: id,
          },
        };
      }

      return {
        where: {},
      };
    },
  };
}
