/* eslint-disable no-unused-vars */
import { Model } from "@sequelize/core";
import { Serializer, SerializerOptions } from "jsonapi-serializer";
import { Scaffold } from "..";
import { JSONObject, ScaffoldModel } from "../types";
import { JSONAPIErrorOptions } from "jsonapi-serializer";
import createHttpError from "http-errors";

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
   * @returns {JSONObject}
   */
  findAll: (data: T[], options?: SerializerOptions) => Promise<JSONObject>;
  findOne: (data: T, options?: SerializerOptions) => Promise<JSONObject>;
  findAndCountAll: (
    data: { rows: T[]; count: number },
    options?: SerializerOptions
  ) => Promise<JSONObject>;
  create: (data: T, options?: SerializerOptions) => Promise<JSONObject>;
  update: (
    rowCount: number,
    options?: SerializerOptions
  ) => Promise<JSONObject>;
  destroy: (
    rowCount: number,
    options?: SerializerOptions
  ) => Promise<JSONObject>;
  error: (options: JSONAPIErrorOptions) => createHttpError.HttpError;
}

async function findAllImpl(
  name: string,
  array,
  options: SerializerOptions = {}
) {
  return new Serializer(name, options).serialize(array);
}

async function findOneImpl(
  name: string,
  instance,
  options: SerializerOptions = {}
) {
  return new Serializer(name, options).serialize(instance);
}

async function findAndCountAllImpl(
  name: string,
  result,
  options: SerializerOptions = {}
) {
  options = Object.assign(options, { meta: { count: result.count } });
  return new Serializer(name, options).serialize(result.rows);
}

async function createImpl(
  name: string,
  instance,
  options: SerializerOptions = {}
) {
  return new Serializer(name, options).serialize(instance);
}

async function destroyImpl(
  name: string,
  rowCount,
  options: SerializerOptions = {}
) {
  options = Object.assign(options, { meta: { count: rowCount } });
  return new Serializer(name, options).serialize(null);
}

async function updateImpl(
  name: string,
  rowCount,
  options: SerializerOptions = {}
) {
  options = Object.assign(options, { meta: { count: rowCount } });
  return new Serializer(name, options).serialize(null);
}

export function buildSerializerForModelStandalone(
  model: ScaffoldModel
): SerializeFunctions {
  return {
    findAll: async (array, options) => findAllImpl(model.name, array, options),
    findOne: async (instance, options) =>
      findOneImpl(model.name, instance, options),
    findAndCountAll: async (result, options) =>
      findAndCountAllImpl(model.name, result, options),
    create: async (instance, options) =>
      createImpl(model.name, instance, options),
    destroy: async (rowCount, options) =>
      destroyImpl(model.name, rowCount, options),
    update: async (rowCount, options) =>
      updateImpl(model.name, rowCount, options),
    error: (options: JSONAPIErrorOptions) => {
      throw new Error(options.title);
    },
  };
}

export function buildSerializerForModel(
  scaffold: Scaffold,
  modelName: string
): SerializeFunctions {
  return {
    findAll: async (array, options) => findAllImpl(modelName, array, options),
    findOne: async (instance, options) =>
      findOneImpl(modelName, instance, options),
    findAndCountAll: async (result, options) =>
      findAndCountAllImpl(modelName, result, options),
    create: async (instance, options) =>
      createImpl(modelName, instance, options),
    destroy: async (rowCount, options) =>
      destroyImpl(modelName, rowCount, options),
    update: async (rowCount, options) =>
      updateImpl(modelName, rowCount, options),
    error: (options: JSONAPIErrorOptions) => {
      return scaffold.createError(options);
    },
  };
}
