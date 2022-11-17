/* eslint-disable no-unused-vars */
import { DestroyOptions, UpdateOptions, Identifier } from "sequelize";
import { Scaffold } from "..";
import { ScaffoldFunctionExportParse } from "../types";

export function buildParserForModel(
  scaffold: Scaffold,
  modelName: string
): ScaffoldFunctionExportParse {
  return {
    findAll: async (query) => {
      return {};
    },
    findOne: async (query, id) => {
      return {
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
        options.where.id = query.id;
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
