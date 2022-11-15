import {
  CreateOptions,
  DestroyOptions,
  FindOptions,
  UpdateOptions,
} from "sequelize";

export function buildParserForModel(name: string) {
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

export function buildParserForModels(names: string[]) {
  const result = {};
  names.forEach((name) => {
    result[name] = buildParserForModel(name);
  });
  return result;
}
