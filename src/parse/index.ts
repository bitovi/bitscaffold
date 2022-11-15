import {
  CreateOptions,
  DestroyOptions,
  FindOptions,
  UpdateOptions,
} from "sequelize";
import {
  ScaffoldModelParser,
  SequelizeModelInstance,
  SequelizeModelsCollection,
  ScaffoldSymbolModel,
} from "../types";

export function buildParserForModel(
  name: string,
  seq: SequelizeModelInstance
): ScaffoldModelParser {
  // eslint-disable-next-line no-unused-vars
  const scaffoldModel = seq[ScaffoldSymbolModel];
  return {
    findAll: async (params): Promise<FindOptions> => {
      console.log("findAll", name, params);
      return {};
    },
    findOne: async (params): Promise<FindOptions> => {
      console.log("findOne", name, params);
      return {};
    },
    findAndCountAll: async (params): Promise<FindOptions> => {
      console.log("findAndCountAll", params);
      return {};
    },
    create: async (params): Promise<CreateOptions> => {
      console.log("create", name, params);
      return {};
    },
    destroy: async (params): Promise<DestroyOptions> => {
      console.log("destroy", name, params);
      return {};
    },
    update: async (params): Promise<UpdateOptions> => {
      console.log("update", name, params);
      return {
        where: {},
      };
    },
  };
}

export function buildParserForModels(models: SequelizeModelsCollection): {
  [modelName: string]: ScaffoldModelParser;
} {
  const names = Object.keys(models);

  const result = {};
  names.forEach((name) => {
    result[name] = buildParserForModel(name, models[name]);
  });
  return result;
}
