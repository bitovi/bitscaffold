/* eslint-disable no-unused-vars */
import { Model } from "sequelize";
import { JSONAPIError, Serializer, SerializerOptions } from "jsonapi-serializer";
import { Scaffold } from "..";
import { JSONObject } from "../types";
import { Error, JSONAPIErrorOptions } from "jsonapi-serializer";
import createHttpError from "http-errors";


/**
 * Provides a set of exported functions, per Model, that 
 * takes data, usually some database/model record, and 
 * converts it into JSON:API response format
 */
export interface SerializeFunctions {
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
  findAll: (data: Model<any, any>[], options?: SerializerOptions) => Promise<JSONObject>;
  findOne: (data: Model<any, any>, options?: SerializerOptions) => Promise<JSONObject>;
  findAndCountAll: (data: { rows: Model<any, any>[], count: number }, options?: SerializerOptions) => Promise<JSONObject>;
  create: (data: Model<any, any>, options?: SerializerOptions) => Promise<JSONObject>;
  update: (rowCount: number, options?: SerializerOptions) => Promise<JSONObject>;
  destroy: (rowCount: number, options?: SerializerOptions) => Promise<JSONObject>;
  error: (options: JSONAPIErrorOptions) => createHttpError.HttpError;
}

export function buildSerializerForModel(
  scaffold: Scaffold,
  modelName: string
): SerializeFunctions {
  return {
    findAll: async (array, options: SerializerOptions = {}) => {
      return new Serializer(modelName, options).serialize(array);
    },
    findOne: async (instance, options: SerializerOptions = {}) => {
      return new Serializer(modelName, options).serialize(instance);
    },
    findAndCountAll: async (result, options: SerializerOptions = {}) => {
      options = Object.assign(options, { dataMeta: { count: result.count } })
      return new Serializer(modelName, options).serialize(result.rows)
    },
    create: async (instance, options: SerializerOptions = {}) => {
      return new Serializer(modelName, options).serialize(instance);
    },
    destroy: async (rowCount, options: SerializerOptions = {}) => {
      options = Object.assign(options, { dataMeta: { count: rowCount } })
      return new Serializer(modelName, options).serialize(null);
    },
    update: async (rowCount, options: SerializerOptions = {}) => {
      options = Object.assign(options, { dataMeta: { count: rowCount } })
      return new Serializer(modelName, options).serialize(null);
    },
    error: (options: JSONAPIErrorOptions) => {
      return scaffold.createError(options);
    }
  };
}
