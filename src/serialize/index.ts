/* eslint-disable no-unused-vars */
import { Model } from "sequelize";
import { JSONAPIError, Serializer } from "jsonapi-serializer";
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
  findAll: (data: Model<any, any>[]) => Promise<JSONObject>;
  findOne: (data: Model<any, any>) => Promise<JSONObject>;
  findAndCountAll: (data: { rows: Model<any, any>[], count: number }) => Promise<JSONObject>;
  create: (data: Model<any, any>) => Promise<JSONObject>;
  update: (rowCount: number) => Promise<JSONObject>;
  destroy: (rowCount: number) => Promise<JSONObject>;
  error: (options: JSONAPIErrorOptions) => createHttpError.HttpError;
}

export function buildSerializerForModel(
  scaffold: Scaffold,
  modelName: string
): SerializeFunctions {
  return {
    findAll: async (array) => {
      return new Serializer(modelName, {}).serialize(array);
    },
    findOne: async (instance) => {
      return new Serializer(modelName, {}).serialize(instance);
    },
    findAndCountAll: async (result) => {
      return new Serializer(modelName, { dataMeta: { count: result.count } }).serialize(result.rows)
    },
    create: async (instance) => {
      return new Serializer(modelName, {}).serialize(instance);
    },
    destroy: async (rowCount) => {
      return new Serializer(modelName, { dataMeta: { count: rowCount } }).serialize(null);
    },
    update: async (rowCount) => {
      return new Serializer(modelName, { dataMeta: { count: rowCount } }).serialize(null);
    },
    error: (options: JSONAPIErrorOptions) => {
      return scaffold.createError(options);
    }
  };
}
