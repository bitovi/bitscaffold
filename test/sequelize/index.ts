import { Sequelize, DataTypes } from "sequelize";
import signale from "signale";

import schema from "./schema.json";


async function buildModels(schema: BitScaffoldSchema): Promise<Sequelize> {
    // Create a sequelize instance to use for connections later
    const sequelize = new Sequelize('sqlite::memory:', {
        logging: (message) => {
            signale.info("  SQL:", message)
        }
    });

    // Go through each of the models creating a Model within sequelize
    // Skip any fields with relationship definitions, we cant do those yet until
    // all the other models have been defined. Otherwise it just wont work...
    Object.keys(schema.models).forEach((modelName) => {
        const model: any = schema.models[modelName];
        signale.info("Creating Model: ", modelName);
        sequelize.define(modelName, model, { createdAt: false, updatedAt: false });
    })


    // Loop over the list of relationship fields? 

    // Link the models together to create relationships?


    // Force the schema into the in memory database
    signale.info("Starting Model Sync");
    await sequelize.sync({ force: true });
    signale.info("Finished Model Sync");

    // Return the completed sequelize instance
    return sequelize;
}

async function init() {
    const parsed = await parseSchemaFile(schema)
    const seq = await buildModels(parsed);

    const Employee = seq.models['Employee'];

    await Employee.create({ name: "Mark" });
    await Employee.create({ name: "Paul" });
    await Employee.create({ name: "Jeff" });
    await Employee.create({ name: "Alex" });

    const all = await Employee.count();
    console.log(all);

}

interface BitScaffoldValidator {
    lt?: string,
    gt?: string,
    eq?: string
}

interface BitScaffoldField {
    type: string,
    primary?: boolean,
    default?: string,
    validate: BitScaffoldValidator
}

interface BitScaffoldModel {
    [FieldName: string]: BitScaffoldField
}

interface BitScaffoldSchema {
    models: {
        [ModelName: string]: BitScaffoldModel
    }
    validation: {
        [ModelName: string]: any
    }
    config: any
}

const BitDataTypes = DataTypes;

async function parseSchemaFile(contents: any): Promise<BitScaffoldSchema> {
    let raw = contents;
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


init()