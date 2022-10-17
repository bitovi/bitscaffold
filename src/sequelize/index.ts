import { BitScaffoldField, BitScaffoldSchema, BitScaffoldValidatorContext, BelongsToManyAssociation } from "../types"
import { Sequelize, ModelAttributeColumnOptions, ModelAttributes, DataTypes, HasManyOptions } from "sequelize"
import { Sequelize as SequelizeTypescript } from "sequelize-typescript"
import signale from "signale";

import { Team } from "./models/Team.model"
import { Player } from "./models/Player.model"

export async function loadModels(): Promise<Sequelize> {
    const sequelize = new SequelizeTypescript('sqlite::memory:', {
        logging: (message) => {
            signale.info("  SQL:", message)
        }
    });

    sequelize.addModels([Team, Player]);

    signale.info("Starting Model Sync");
    await sequelize.sync({ force: true });
    signale.info("Finished Model Sync");

    return sequelize;
}

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

            // Handle string and string[] type inputs for relationships
            let hasOneData: string[];
            if (!Array.isArray(modelData.hasOne)) {
                hasOneData = [modelData.hasOne];
            } else {
                hasOneData = modelData.hasOne;
            }

            // Loop over the relationships and attach them to the main model
            hasOneData.forEach((associatedModelName) => {
                // Check if the requested model is one we know about
                if (!sequelize.isDefined(associatedModelName)) {
                    throw new Error("Unknown Model requested in hasOne relationship: " + associatedModelName)
                }

                const ModelB = sequelize.models[associatedModelName];
                ModelA.hasOne(ModelB);
                signale.info(ModelA.name, "has one", ModelB.name)
            });
        }


        if (modelData.hasMany) {

            // Handle string and string[] type inputs for relationships
            let hasManyData: string[];
            if (!Array.isArray(modelData.hasMany)) {
                hasManyData = [modelData.hasMany];
            } else {
                hasManyData = modelData.hasMany;
            }

            hasManyData.forEach((associatedModelName) => {
                const hasManyOptions: HasManyOptions = {}

                // if (typeof modelData.hasMany === "object") {
                //     associatedModelName = modelData.hasMany.model;
                //     hasManyOptions.as = modelData.hasMany.as;
                // }

                // if (typeof modelData.hasMany === "string") {
                //     associatedModelName = modelData.hasMany;
                //     hasManyOptions.as = modelData.hasMany;
                // }

                hasManyOptions.as = associatedModelName;

                // Check if the requested model is one we know about
                if (!sequelize.isDefined(associatedModelName)) {
                    throw new Error("Unknown Model requested in hasMany relationship: " + associatedModelName)
                }

                const ModelB = sequelize.models[associatedModelName];
                ModelA.hasMany(ModelB, hasManyOptions);
                signale.info(ModelA.name, "has many", ModelB.name)
            });
        }

        if (modelData.belongsTo) {

            // Handle string and string[] type inputs for relationships
            let belongsToData: string[];
            if (!Array.isArray(modelData.belongsTo)) {
                belongsToData = [modelData.belongsTo];
            } else {
                belongsToData = modelData.belongsTo;
            }

            belongsToData.forEach((associatedModelName) => {
                // Check if the requested model is one we know about
                if (!sequelize.isDefined(associatedModelName)) {
                    throw new Error("Unknown Model requested in belongsTo relationship: " + associatedModelName)
                }

                const ModelB = sequelize.models[associatedModelName];
                ModelA.belongsTo(ModelB);
                signale.info(ModelA.name, "belongs to", ModelB.name)
            })
        }

        if (modelData.belongsToMany) {

            // More special case, this isnt just a string / string[], there are required options...
            let belongsToManyData: BelongsToManyAssociation[];
            if (!Array.isArray(modelData.belongsToMany)) {
                belongsToManyData = [modelData.belongsToMany];
            } else {
                belongsToManyData = modelData.belongsToMany;
            }

            belongsToManyData.forEach((belongsToManyAssociation) => {
                let associatedModelName: string = belongsToManyAssociation.model;

                // Check if the requested model is one we know about
                if (!sequelize.isDefined(associatedModelName)) {
                    throw new Error("Unknown Model requested in belongsToMany relationship: " + associatedModelName)
                }

                const ModelB = sequelize.models[associatedModelName];
                ModelA.belongsToMany(ModelB, { through: belongsToManyAssociation.through, as: associatedModelName });
                signale.info(ModelA.name, "belongs to many", ModelB.name, "through", belongsToManyAssociation.through);
            });
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
