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
    findAll: async (query): Promise<FindOptions> => {
      console.log("findAll", name, query);
      return {};
    },
    findOne: async (query): Promise<FindOptions> => {
      console.log("findOne", name, query);
      return {};
    },
    findAndCountAll: async (query): Promise<FindOptions> => {
      console.log("findAndCountAll", query);
      return {};
    },
    create: async (query): Promise<CreateOptions> => {
      console.log("create", name, query);
      return {};
    },
    destroy: async (query): Promise<DestroyOptions> => {
      console.log("destroy", name, query);
      return {};
    },
    update: async (query): Promise<UpdateOptions> => {
      console.log("update", name, query);
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
