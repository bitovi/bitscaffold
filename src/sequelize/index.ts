import { Model, Sequelize, Options, DataTypes } from "sequelize";
import JSONAPISerializer from "json-api-serializer";
import querystringParser from "@bitovi/sequelize-querystring-parser";
import {
  ScaffoldModel,
  SequelizeModelsCollection,
  ScaffoldSymbolModel,
  ScaffoldModelCollection,
  Virtuals,
} from "../types";
import * as inflection from "inflection";
import extendSequelize from "sequelize-create-with-associations";
import { Scaffold } from "..";
import { registerSchema } from "../serialize";
import { ScaffoldError } from "../error/errors";
import { codes, statusCodes } from "../error/constants";

const splitIncludeToJSONAPiQuery = (include) => {
  return `include=${include.join(",")}`;
};

export interface ICreateScaffoldModel {
  models: SequelizeModelsCollection;
  virtuals: Virtuals;
}

export function buildScaffoldModelObject(
  models: SequelizeModelsCollection
): ScaffoldModelCollection {
  const names = Object.keys(models);

  const result: ScaffoldModelCollection = {};
  names.forEach((name) => {
    result[name] = models[name][ScaffoldSymbolModel];
  });
  return result;
}

export function createSequelizeInstance(
  scaffold: Scaffold,
  options?: Options
): Sequelize {
  extendSequelize(Sequelize);

  if (!options) {
    return new Sequelize("sqlite::memory:", {
      logging: false,
    });
  }

  const sequelize: Sequelize = new Sequelize(options);
  return sequelize;
}

export function convertScaffoldModels(
  sequelize: Sequelize,
  serializer: JSONAPISerializer,
  models: ScaffoldModel[]
): ICreateScaffoldModel {
  const virtuals: Virtuals = {};
  const primaryKeys: Record<string, string> = {};
  models.forEach((model) => {
    for (const attributeKey in model.attributes) {
      const attribute = model.attributes[attributeKey];
      const { type, include } = attribute;

      let updatedInclude = include;
      if (updatedInclude) {
        updatedInclude = Array.isArray(include) ? include : [include];
        const query = splitIncludeToJSONAPiQuery(updatedInclude);
        const parser = querystringParser.parse(query);
        if (parser.errors.length === 0) {
          updatedInclude = parser.data.include;
        }
      }

      if (
        type instanceof DataTypes.VIRTUAL ||
        (type && type.key === "VIRTUAL")
      ) {
        if (virtuals[model.name]) {
          virtuals[model.name][attributeKey] = updatedInclude || [];
        } else {
          virtuals[model.name] = {
            [attributeKey]: updatedInclude || [],
          };
        }

        include && delete attribute.include;
      }
    }

    const temp = sequelize.define<Model<ScaffoldModel["attributes"]>>(
      model.name,
      model.attributes,
      {
        validate: model.validation || {},
        underscored: true,
        createdAt: false,
        updatedAt: false,
        freezeTableName: true,
      }
    );

    // GET THE PRIMARY KEY
    primaryKeys[model.name] = temp.primaryKeyAttribute;

    temp[ScaffoldSymbolModel] = model;
  });

  models.forEach((model) => {
    const relationships = ["belongsTo", "belongsToMany", "hasOne", "hasMany"];
    const associations: Record<string, string> = {};

    relationships.forEach((relationship) => {
      // For each relationship type, check if we have definitions for it:
      if (model[relationship]) {
        // Grab the array of targets and options
        model[relationship].forEach(({ target, options }) => {
          if (!target || !sequelize.models[target]) {
            throw new ScaffoldError({
              title:
                "Unknown Model association for " +
                model.name +
                " in " +
                relationship,
              status: statusCodes.CONFLICT,
              code: codes.ERR_CONFLICT,
            });
          }

          // Pull the models off sequelize.models
          const current = sequelize.models[model.name];
          const associated = sequelize.models[target];

          // Create the relationship
          current[relationship](associated, options);

          let associationName = options.as;
          if (!associationName) {
            associationName = target.toLowerCase();
            if (relationship !== "hasOne" && relationship !== "belongsTo") {
              associationName = inflection.pluralize(target);
            }
          }

          associations[associationName] = target;
        });
      }
    });
    // Create the serializer schema for the model
    registerSchema(serializer, model, associations, primaryKeys[model.name]);
  });

  return {
    models: sequelize.models as SequelizeModelsCollection,
    virtuals,
  };
}
