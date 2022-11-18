import { ParsedUrlQuery } from "node:querystring";
import { Identifier, WhereOptions } from "sequelize";

export function buildAttributeList(query: ParsedUrlQuery): string[] {
  const queryAttributes = query.attributes;

  let attributes: string[] = [];
  if (queryAttributes) {
    if (!Array.isArray(queryAttributes)) {
      attributes = [queryAttributes];
    } else {
      attributes = queryAttributes;
    }
  }

  if (!attributes.includes("id")) {
    attributes.push("id");
  }

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
