import {
  ScaffoldModelSerialize,
  ScaffoldSerializedResponse,
  SequelizeModelsCollection,
  ScaffoldSymbolModel,
  SequelizeModelInstance,
} from "../types";

export function buildSerializerForModel(
  name: string,
  seq: SequelizeModelInstance
): ScaffoldModelSerialize {
  // eslint-disable-next-line no-unused-vars
  const scaffoldModel = seq[ScaffoldSymbolModel];

  return {
    findAll: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("findAll", name);
      return params as ScaffoldSerializedResponse;
    },
    findOne: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("findOne", name);
      return params as ScaffoldSerializedResponse;
    },
    findAndCountAll: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("findAndCountAll", name);
      return params as ScaffoldSerializedResponse;
    },
    create: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("create", name);
      return params as ScaffoldSerializedResponse;
    },
    destroy: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("destroy", name);
      return params as ScaffoldSerializedResponse;
    },
    update: async (params): Promise<ScaffoldSerializedResponse> => {
      console.log("update", name);
      return params as ScaffoldSerializedResponse;
    },
  };
}

export function buildSerializerForModels(models: SequelizeModelsCollection): {
  [name: string]: ScaffoldModelSerialize;
} {
  const names = Object.keys(models);

  const result = {};
  names.forEach((name) => {
    result[name] = buildSerializerForModel(name, models[name]);
  });
  return result;
}
