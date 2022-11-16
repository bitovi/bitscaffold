/* eslint-disable no-unused-vars */
import { Scaffold } from "..";
import { ScaffoldFunctionExportSerialize } from "../types";

export function buildSerializerForModel(
  scaffold: Scaffold,
  modelName: string
): ScaffoldFunctionExportSerialize {
  return {
    findAll: async (params) => {
      return params;
    },
    findOne: async (params) => {
      return params;
    },
    findAndCountAll: async (params) => {
      return params;
    },
    create: async (params) => {
      return params;
    },
    destroy: async (params) => {
      return params;
    },
    update: async (params) => {
      return params;
    },
  };
}
