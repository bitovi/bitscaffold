import { BitScaffoldField, BitScaffoldSchema, BitScaffoldValidatorContext } from "../types"
import { Sequelize, ModelAttributeColumnOptions, ModelAttributes, DataTypes } from "sequelize"
import signale from "signale";

export async function buildModels(schema: BitScaffoldSchema): Promise<Sequelize> {
    const sequelize = new Sequelize('sqlite::memory:', {
        logging: (message) => {
            signale.info("  SQL:", message)
        }
    });

    // Build models from the definitions
    for (const [modelName, modelData] of Object.entries(schema.models)) {
        signale.info("Creating Model: ", modelName);

        const sequelizeModelFields: ModelAttributes = {};
        for (const [fieldName, fieldData] of Object.entries(modelData.fields)) {
            sequelizeModelFields[fieldName] = normalizeSequelizeField(fieldName, fieldData);
        }

        let tableName = modelName.toLowerCase();
        if (modelData.name) {
            tableName = modelData.name;
        }

        sequelize.define(modelName, sequelizeModelFields, { createdAt: false, updatedAt: false, tableName: tableName });
    }

    // Map model relationships
    for (const [modelName, modelData] of Object.entries(schema.models)) {
        signale.info("Building Model Relationships: ", modelName);

        // Grab the existing model from sequelize
        const ModelA = sequelize.models[modelName];

        if (modelData.hasOne) {
            // Check if the requested model is one we know about
            if (!sequelize.isDefined(modelData.hasOne)) {
                throw new Error("Unknown Model requested in hasOne relationship: " + modelData.hasOne)
            }

            const ModelB = sequelize.models[modelData.hasOne];
            ModelA.hasOne(ModelB);
        }


        if (modelData.hasMany) {
            // Check if the requested model is one we know about
            if (!sequelize.isDefined(modelData.hasMany)) {
                throw new Error("Unknown Model requested in hasMany relationship: " + modelData.hasMany)
            }

            const ModelB = sequelize.models[modelData.hasMany];
            ModelA.hasMany(ModelB);
        }

        if (modelData.belongsTo) {
            // Check if the requested model is one we know about
            if (!sequelize.isDefined(modelData.belongsTo)) {
                throw new Error("Unknown Model requested in belongsTo relationship: " + modelData.belongsTo)
            }

            const ModelB = sequelize.models[modelData.belongsTo];
            ModelA.belongsTo(ModelB);
        }

        if (modelData.belongsToMany) {
            // Check if the requested model is one we know about
            if (!sequelize.isDefined(modelData.belongsToMany)) {
                throw new Error("Unknown Model requested in belongsToMany relationship: " + modelData.belongsToMany)
            }

            const ModelB = sequelize.models[modelData.belongsToMany];
            const through = modelName + "__" + modelData.belongsToMany;
            ModelA.belongsToMany(ModelB, { through: through });
        }
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
