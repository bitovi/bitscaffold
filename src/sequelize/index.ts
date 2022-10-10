import { BitScaffoldField, BitScaffoldSchema, BitScaffoldValidatorContext } from "../types"
import { Sequelize, ModelAttributeColumnOptions, ModelAttributes, DataTypes } from "sequelize"
import signale from "signale";

export async function buildModels(schema: BitScaffoldSchema): Promise<Sequelize> {
    const sequelize = new Sequelize('sqlite::memory:', {
        logging: (message) => {
            signale.info("  SQL:", message)
        }
    });

    for (const [modelName, modelData] of Object.entries(schema.models)) {
        signale.info("Creating Model: ", modelName);

        const sequelizeModelFields: ModelAttributes = {};
        for (const [fieldName, fieldData] of Object.entries(modelData.fields)) {
            sequelizeModelFields[fieldName] = normalizeSequelizeField(fieldName, fieldData);
        }
        sequelize.define(modelName, sequelizeModelFields, { createdAt: false, updatedAt: false });
    }

    signale.info("Starting Model Sync");
    await sequelize.sync({ force: true });
    signale.info("Finished Model Sync");

    return sequelize;
}

function normalizeSequelizeField(name: string, fieldData: BitScaffoldField): ModelAttributeColumnOptions {

    // Check that the requested type is a valid Sequelize model type (or that we can convert it somehow)
    let type = fieldData.type.toUpperCase();
    if (!DataTypes[type]) {
        throw new Error("Unknown field type requested for " + name + ", requested type: " + type);
    }

    // Create the new Model Attribute Options
    const fieldAttributes: ModelAttributeColumnOptions = { type: type };

    // Check the other optional properties and attach them if needed
    if (fieldData.default) {
        signale.info("Unhandled for the moment...");
    }

    if (fieldData.required) {
        fieldAttributes.allowNull = false;
    }

    if (fieldData.autoIncrement) {
        fieldAttributes.autoIncrement = true;
    }

    if (fieldData.primary) {
        fieldAttributes.primaryKey = true;
    } else {
        fieldAttributes.primaryKey = false;
    }

    return fieldAttributes;
}


export async function buildValidation(schema: BitScaffoldSchema): Promise<BitScaffoldValidatorContext> {

    const scaffoldValidation: BitScaffoldValidatorContext = {};

    for (const [modelName, modelData] of Object.entries(schema.models)) {
        signale.info("Creating Model Validation: ", modelName);
        scaffoldValidation[modelName] = false;

        if (modelData.validations) {
            scaffoldValidation[modelName] = {};

            for (const [fieldName, fieldValidationData] of Object.entries(modelData.validations)) {
                console.log(fieldName, fieldValidationData);
                scaffoldValidation[modelName[fieldName]] = fieldValidationData;
            }
        }
    }

    return scaffoldValidation;
}
