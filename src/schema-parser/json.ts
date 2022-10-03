import fs from "node:fs/promises";
import { DataTypes } from "sequelize";
import { BitScaffoldSchema, } from "../types"

// Export Functions for Prisma Parser type
export function readSchemaFile(path: string): Promise<string> {
    return fs.readFile(path, { encoding: "utf-8" });
}

export function writeSchemaFile(path: string, schema: string): Promise<void> {
    return fs.writeFile(path, schema, { encoding: "utf-8" });
}

export async function parseSchemaFile(contents: string): Promise<BitScaffoldSchema> {
    const raw = JSON.parse(contents);

    const schema = { models: {}, validation: {}, config: {} };

    if (!raw.models) {
        throw new Error("Invalid Schema File: Missing models");
    }

    const models = Object.keys(raw.models);
    models.forEach((modelName) => {
        schema.models[modelName] = {};
        const modelData = raw.models[modelName];

        const fields = Object.keys(modelData);
        fields.forEach((fieldName) => {
            const fieldData = modelData[fieldName];
            schema.models[modelName][fieldName] = {};


            if (!fieldData.type) {
                throw new Error("Invalid Model Definition: Missing type")
            }

            if (!DataTypes[fieldData.type]) {
                throw new Error("Invalid Model Definition: Unknown type '" + fieldData.type + "'")
            }

            schema.models[modelName][fieldName].type = DataTypes[fieldData.type];

            if (fieldData.primary) {
                schema.models[modelName][fieldName].primaryKey = fieldData.primary;
            }

            if (fieldData.default) {
                // schema.models[modelName][fieldName].default = fieldData.default;
            }

            if (fieldData.autoIncrement) {
                schema.models[modelName][fieldName].autoIncrement = fieldData.autoIncrement;
            }

            if (fieldData.validate) {
                if (!schema.validation[modelName]) {
                    schema.validation[modelName] = {};
                }

                schema.validation[modelName][fieldName] = { hasValidationRule: true };
            }
        });
    });

    return schema;
}

export function printSchemaFile(schema: BitScaffoldSchema): void {
    return console.log(JSON.stringify(schema));
}


