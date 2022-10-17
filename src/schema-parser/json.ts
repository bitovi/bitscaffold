import fs from "node:fs/promises";
import { BitScaffoldSchema, } from "../types"

// Export Functions for Prisma Parser type
export function readSchemaFile(path: string): Promise<string> {
    return fs.readFile(path, { encoding: "utf-8" });
}

export function writeSchemaFile(path: string, schema: string): Promise<void> {
    return fs.writeFile(path, schema, { encoding: "utf-8" });
}

export async function parseSchemaFile(contents: string): Promise<BitScaffoldSchema> {
    const schema = JSON.parse(contents);
    return schema;
}

export function printSchemaFile(schema: BitScaffoldSchema): void {
    return console.log(JSON.stringify(schema));
}


