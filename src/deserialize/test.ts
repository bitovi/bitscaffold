/* eslint-disable no-unused-vars */
import { Deserializer, DeserializerOptions } from "jsonapi-serializer";
import { Scaffold } from "..";
import { JSONObject } from "../types";

/**
 * Provides a set of exported functions, per Model, that
 * takes data, usually some database/model record, and
 * converts it into JSON:API response format
 */
export interface DeserializeFunctions {
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
  create: (data: unknown, options?: DeserializerOptions) => Promise<JSONObject>;
  update: (data: unknown, options?: DeserializerOptions) => Promise<JSONObject>;
}

export function buildDeserializerForModelStandalone() {
  return {
    create: async (data, options: DeserializerOptions = {}) => {
      try {
        return new Deserializer(options).deserialize(data);
      } catch (err) {
        return data;
      }
    },

    update: async (data, options: DeserializerOptions = {}) => {
      try {
        return new Deserializer(options).deserialize(data);
      } catch (err) {
        return data;
      }
    },
  };
}

export function buildDeserializerForModel(
  scaffold: Scaffold,
  modelName: string
): DeserializeFunctions {
  return {
    create: async (data, options: DeserializerOptions = {}) => {
      try {
        return new Deserializer(options).deserialize(data);
      } catch (err) {
        return data;
      }
    },

    update: async (data, options: DeserializerOptions = {}) => {
      try {
        return new Deserializer(options).deserialize(data);
      } catch (err) {
        return data;
      }
    },
  };
}