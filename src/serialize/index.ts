import { ScaffoldModelSerialize, ScaffoldSerializedResponse } from "../types";

export function buildSerializerForModel(name: string): ScaffoldModelSerialize {
  return {
    findAll: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("findAll", name, params);
      return {};
    },
    findOne: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("findOne", name, params);
      return {};
    },
    findAndCountAll: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("findAndCountAll", params);
      return {};
    },
    create: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("create", name, params);
      return {};
    },
    destroy: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("destroy", name, params);
      return {};
    },
    update: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("update", name, params);
      return {
        where: {},
      };
    },
  };
}

export function buildSerializerForModels(names: string[]): { [name: string]: ScaffoldModelSerialize } {
  const result = {};
  names.forEach((name) => {
    result[name] = buildSerializerForModel(name);
  });
  return result;
}
