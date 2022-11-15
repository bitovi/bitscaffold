export function buildSerializerForModel(name: string) {
  return {
    findAll: async (params): Promise<unknown> => {
      console.log("findAll", name, params);
      return {};
    },
    findOne: async (params): Promise<unknown> => {
      console.log("findOne", name, params);
      return {};
    },
    findAndCountAll: async (params): Promise<unknown> => {
      console.log("findAndCountAll", params);
      return {};
    },
    create: async (params): Promise<unknown> => {
      console.log("create", name, params);
      return {};
    },
    destroy: async (params): Promise<unknown> => {
      console.log("destroy", name, params);
      return {};
    },
    update: async (params): Promise<unknown> => {
      console.log("update", name, params);
      return {
        where: {},
      };
    },
  };
}

export function buildSerializerForModels(names: string[]) {
  const result = {};
  names.forEach((name) => {
    result[name] = buildSerializerForModel(name);
  });
  return result;
}
