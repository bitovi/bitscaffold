import { table } from "console";
import { Sequelize, DataTypes } from "sequelize";
import signale from "signale";

//import schema from "./schema.json";
import * as schema from "./schema";

async function buildModels(schema: any): Promise<Sequelize> {
    // Create a sequelize instance to use for connections later
    const sequelize = new Sequelize('sqlite::memory:', {
        logging: (message) => {
            signale.info("  SQL:", message)
        }
    });

    const models = Object.keys(schema);
    models.forEach((model) => {
        signale.info("Creating Model: ", model);
        const fields = Object.keys(schema[model].fields);
        const tableName = schema[model].tableName;

        const parsedFields = {};
        fields.forEach((field) => {
            parsedFields[field] = {};
            const fieldData = schema[model].fields[field];

            if (fieldData.primary) {
                parsedFields[field].primaryKey = true;
            }

            if (fieldData.required) {
                parsedFields[field].required = true
            } else {
                parsedFields[field].required = false;
            }

            if (!fieldData.type) {
                throw new Error("Must supply type")
            }

            parsedFields[field].type = fieldData.type.toUpperCase();
        });

        sequelize.define(model, parsedFields, { createdAt: false, updatedAt: false, tableName: tableName });
    });

    // Handle the relationship building
    models.forEach((model) => {
        const relationships = Object.keys(schema[model].relationships);
        relationships.forEach((relationship) => {
            const relationData = schema[model].relationships[relationship];
            signale.info(relationship);

            if (!sequelize.models[relationData.modelClass.name]) {
                throw new Error("Unknown Relation Model:" + relationData.modelClass.name);
            }

            switch (relationData.relation) {
                case "ManyToManyRelation": {
                    sequelize.models[model].belongsToMany(sequelize.models[relationData.modelClass.name], { through: relationData.join })
                    sequelize.models[relationData.modelClass.name].belongsToMany(sequelize.models[model], { through: relationData.join })
                    break;
                }

                default: {
                    signale.error("Unhandled relation type:" + relationData.relation);
                }
            }
        });
    })



    // Force the schema into the in memory database
    signale.info("Starting Model Sync");
    await sequelize.sync({ force: true });
    signale.info("Finished Model Sync");

    // Return the completed sequelize instance
    return sequelize;
}

async function init() {
    //const parsed = await parseSchemaFileTs(schema)
    const seq = await buildModels(schema);

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

async function parseSchemaFileTs(contents: any): Promise<BitScaffoldSchema> {
    const schema = { models: {}, validation: {}, config: {} };

    const models = Object.keys(contents);
    console.log("Models", models);
    models.forEach((modelName) => {
        schema.models[modelName] = {};
        const ModelClass = contents[modelName];
        const model = new ModelClass();

        const fields = Object.keys(ModelClass.fields);
        const relationships = Object.keys(ModelClass.relationships);


        fields.forEach((fieldName) => {
            const fieldData = ModelClass.fields[fieldName];
            schema.models[modelName][fieldName] = {};

            if (!fieldData.type) {
                throw new Error("Invalid Model Definition: Missing type")
            }

            if (fieldData.type === "datetime") {
                fieldData.type = "DATE";
            }

            if (!DataTypes[fieldData.type.toUpperCase()]) {
                throw new Error("Invalid Model Definition: Unknown type '" + fieldData.type + "'")
            }

            schema.models[modelName][fieldName].type = DataTypes[fieldData.type.toUpperCase()];

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