/* eslint-disable no-unused-vars */
import {
  DestroyOptions,
  UpdateOptions,
  Identifier,
  CreateOptions,
  FindOptions,
} from "sequelize";
import { Scaffold } from "..";
import {
  buildCreateOptions,
  buildDestroyOptions,
  buildFindOptions,
  buildUpdateOptions,
} from "./builder";
import { buildDeserializerForModel } from "../deserialize";
import { JSONObject, ScaffoldModel } from "../types";

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
  findAll: (querystring: string) => Promise<FindOptions>;
  findOne: (querystring: string, id: Identifier) => Promise<FindOptions>;
  findAndCountAll: (querystring: string) => Promise<FindOptions>;
  create: (body: unknown) => Promise<{ body: JSONObject; ops: CreateOptions }>;
  update: (
    body: unknown,
    id?: Identifier
  ) => Promise<{ body: JSONObject; ops: UpdateOptions }>;
  destroy: (querystring: string, id?: Identifier) => Promise<DestroyOptions>;
}

export function buildParserForModelStandalone(
  model: ScaffoldModel
): ParseFunctions {
  throw new Error("Not Implemented");
}

export function buildParserForModel(
  scaffold: Scaffold,
  modelName: string
): ParseFunctions {
  const deserializer = buildDeserializerForModel(scaffold, modelName);

  return {
    findAll: async (querystring: string) => {
      const { data, errors } = buildFindOptions(
        scaffold.model[modelName],
        querystring
      );
      if (errors.length > 0) {
        throw scaffold.createError({
          code: "400",
          title: "Bad Request, Invalid Query String",
        });
      }
      return data;
    },
    findOne: async (querystring: string, id) => {
      const { data, errors } = buildFindOptions(
        scaffold.model[modelName],
        querystring,
        id
      );
      if (errors.length > 0) {
        throw scaffold.createError({
          code: "400",
          title: "Bad Request, Invalid Query String",
        });
      }
      return data;
    },
    findAndCountAll: async (querystring: string) => {
      const { data, errors } = buildFindOptions(
        scaffold.model[modelName],
        querystring
      );
      if (errors.length > 0) {
        throw scaffold.createError({
          code: "400",
          title: "Bad Request, Invalid Query String",
        });
      }
      return data;
    },
    create: async (body: unknown) => {
      const { data, errors } = buildCreateOptions("");
      if (errors.length > 0) {
        throw scaffold.createError({
          code: "400",
          title: "Bad Request, Invalid Query String",
        });
      }

      const parsed = await deserializer.create(body, {});

      return {
        body: parsed,
        ops: data,
      };
    },
    destroy: async (querystring: string, id) => {
      const { data, errors } = buildDestroyOptions(querystring, id);
      if (errors.length > 0) {
        throw scaffold.createError({
          code: "400",
          title: "Bad Request, Invalid Query String",
        });
      }

      return data;
    },
    update: async (body, id) => {
      const { data, errors } = buildUpdateOptions("", id);
      if (errors.length > 0) {
        throw scaffold.createError({
          code: "400",
          title: "Bad Request, Invalid Query String",
        });
      }

      const parsed = await deserializer.create(body, {});

      return {
        body: parsed,
        ops: data,
      };
    },
  };
}
