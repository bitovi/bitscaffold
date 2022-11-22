import { ParsedUrlQuery } from "node:querystring";
import { Identifier, WhereOptions } from "sequelize";
import { SequelizeModelInstance } from "../types";

export function buildAttributeList(
  query: ParsedUrlQuery,
  // eslint-disable-next-line no-unused-vars
  seqModel: SequelizeModelInstance
): string[] {
  const queryAttributes = query.attributes;

  let attributes: string[] = [];
  if (queryAttributes) {
    if (!Array.isArray(queryAttributes)) {
      attributes = [queryAttributes];
    } else {
      attributes = queryAttributes;
    }
  }

  // We should always return the pk, which is usually id?
  if (!attributes.includes("id")) {
    attributes.push("id");
  }

  attributes.forEach((attr) => {
    // Make sure that the requested attributes actually exist on the model
    const modelAttributes = seqModel.getAttributes()
    if (!modelAttributes[attr]) {
      throw new Error("Bad Attribute:" + attr);
    }
  });

  return attributes;
}

export function buildWhereClause(
  query: ParsedUrlQuery,
  id?: Identifier
): WhereOptions {
  if (id) {
    return {
      id: id,
    };
  }

  return {};
}
