/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Model } from "sequelize";
import { Scaffold } from "..";

import * as inflection from "inflection";
import JSONAPISerializer from "json-api-serializer";
import { JSONAPIDocument } from "json-api-serializer";
import { IAssociation } from "../sequelize/types";
import { ScaffoldModel } from "../types";

/**
 * Provides a set of exported functions, per Model, that
 * takes data, usually some database/model record, and
 * converts it into JSON:API response format
 */
export interface SerializeFunctions<
  T extends Model<any, any> = Model<any, any>
> {
  /**
   * Takes a Model instance and converts it into a
   * JSON:API serialized response that can be returned
   * to the caller
   *
   * In most normal use cases this can come directly from the
   * output of a Model query operation.
   *
   * @returns {JSONAPIDocument}
   */
  findAll: (data: T[]) => Promise<JSONAPIDocument>;
  findOne: (data: T) => Promise<JSONAPIDocument>;
  findAndCountAll: (data: {
    rows: T[];
    count: number;
  }) => Promise<JSONAPIDocument>;
  create: (data: T) => Promise<JSONAPIDocument>;
  update: (rowCount: number) => Promise<JSONAPIDocument>;
  destroy: (rowCount: number) => Promise<JSONAPIDocument>;
}

async function findAllImpl(scaffold: Scaffold, name: string, array) {
  return scaffold.serializer.serialize(name, array);
}

async function findOneImpl(scaffold: Scaffold, name: string, instance) {
  return scaffold.serializer.serialize(name, instance);
}

async function findAndCountAllImpl(scaffold: Scaffold, name: string, result) {
  return scaffold.serializer.serialize(name, result.rows);
}

async function createImpl(scaffold: Scaffold, name: string, instance) {
  return scaffold.serializer.serialize(name, instance);
}

async function destroyImpl(scaffold: Scaffold, name: string, rowCount) {
  return scaffold.serializer.serialize(name, null, { count: rowCount });
}

async function updateImpl(scaffold: Scaffold, name: string, rowCount) {
  return scaffold.serializer.serialize(name, null, { count: rowCount });
}

// export function buildSerializerForModelStandalone(
//     serializer: JSONAPISerializer,
//     model: ScaffoldModel
// ): SerializeFunctions {
//   return {
//     findAll: async (array) => findAllImpl(model.name, array),
//     findOne: async (instance) =>
//       findOneImpl(model.name, instance),
//     findAndCountAll: async (result) =>
//       findAndCountAllImpl(model.name, result),
//     create: async (instance) =>
//       createImpl(model.name, instance),
//     destroy: async (rowCount) =>
//       destroyImpl(model.name, rowCount),
//     update: async (rowCount) =>
//       updateImpl(model.name, rowCount),
//     error: (options: JSONAPIErrorOptions) => {
//       throw new Error(options.title);
//     },
//   };
// }

export function buildSerializerForModel(
  scaffold: Scaffold,
  modelName: string
): SerializeFunctions {
  return {
    findAll: async (array) => findAllImpl(scaffold, modelName, array),
    findOne: async (instance) => findOneImpl(scaffold, modelName, instance),
    findAndCountAll: async (result) =>
      findAndCountAllImpl(scaffold, modelName, result),
    create: async (instance) => createImpl(scaffold, modelName, instance),
    destroy: async (rowCount) => destroyImpl(scaffold, modelName, rowCount),
    update: async (rowCount) => updateImpl(scaffold, modelName, rowCount),
  };
}

const deserialize = (data: any) => {
  if (data) {
    const { id } = data;
    return { id };
  }
  return data;
};

export function registerSchema(
  serializer: JSONAPISerializer,
  model: ScaffoldModel,
  associations: Record<string, IAssociation>,
  primaryKey: string
) {
  const relationships: { [key: string]: any } = {};
  const associationsKeys = Object.keys(associations);
  associationsKeys.forEach((associationsKey) => {
    const association = associations[associationsKey];
    const associationType = inflection.pluralize(
      association.model.toLowerCase()
    );
    relationships[associationType] = {
      type: association.model,
      deserialize,
    };
  });
  serializer.register(model.name, {
    id: primaryKey,
    whitelist: Object.keys(model.attributes),
    relationships,
  });
}
