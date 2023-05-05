export const addVirtuals = function ({
  queryOptions,
  scaffold,
  modelName,
  all = false,
}) {
  const virtualsForModel = scaffold.virtuals[modelName];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let options: any = {
    include: [],
  };
  if (queryOptions) {
    if (!queryOptions.attributes) {
      options.include = all ? { all: true } : [];
    } else {
      queryOptions.attributes.forEach((attribute) => {
        if (
          virtualsForModel &&
          virtualsForModel[attribute] &&
          virtualsForModel[attribute] !== ""
        ) {
          options.include.push(
            ...options.include,
            ...virtualsForModel[attribute]
          );
        }
      });

      if (queryOptions.include) {
        if (Array.isArray(queryOptions.include)) {
          options.include.push(...queryOptions.include);
        } else {
          options.include.push(queryOptions.include);
        }

        delete queryOptions.include;
      }
    }

    options = Object.assign(options, queryOptions);
  } else {
    options.include = all ? { all: true } : [];
  }

  if (virtualsForModel) {
    if (modelHasUnsolicitedVirtuals(virtualsForModel, queryOptions)) {
      options = handleUnsolicitedVirtualFields(
        queryOptions,
        options,
        virtualsForModel
      );
    }
  }

  options.include.length < 1 && delete options.include;

  return options;
};

const modelHasUnsolicitedVirtuals = (virtualFields, options): boolean => {
  if (!options.attributes) {
    return true;
  } else {
    const { attributes } = options;
    if (Array.isArray(attributes)) {
      return attributes.includes(virtualFields);
    } else {
      return attributes.includes.includes(virtualFields);
    }
  }
};

const handleUnsolicitedVirtualFields = (
  queryOptions,
  options,
  virtualsForModel
) => {
  const queriedAttributes = queryOptions.attributes;
  let attributes = {
    include: [] as String[],
    exclude: [] as String[],
  };

  if (queriedAttributes) {
    const { include, exclude } = spreadQueryAttributes(queriedAttributes);
    attributes.include = include;
    attributes.exclude = exclude;
  }

  attributes.exclude = excludeUnspecifiedVirtuals(attributes, virtualsForModel);

  return options;
};

const spreadQueryAttributes = (
  queriedAttributes
): { include: Array<String>; exclude: Array<String> } => {
  if (Array.isArray(queriedAttributes)) {
    return { include: [...queriedAttributes], exclude: [] };
  } else {
    return {
      include: [...queriedAttributes.include],
      exclude: [...queriedAttributes.exclude],
    };
  }
};

const excludeUnspecifiedVirtuals = (attributes, virtualsForModel) => {
  Object.keys(virtualsForModel).forEach((virtualField) => {
    const isVirtualIncluded = attributes.include.includes(attributes);
    if (!isVirtualIncluded) {
      attributes?.exclude?.push(virtualField);
    }
  });

  return attributes;
};
