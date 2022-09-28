import fs from "node:fs/promises";
import { getSchema, printSchema, Schema } from "@mrleebo/prisma-ast";

export function readSchemaFile(path: string): Promise<string> {
  return fs.readFile(path, { encoding: "utf-8" });
}

export function writeSchemaFile(path: string, schema: Schema): Promise<void> {
  const converted = printSchema(schema);
  return fs.writeFile(path, converted, { encoding: "utf-8" });
}

export function parseSchemaFile(file: string): Schema {
  return getSchema(file);
}

export function printSchemaFile(schema: Schema): void {
  schema.list.forEach((block) => {
    console.log(block.type);
  });
}
