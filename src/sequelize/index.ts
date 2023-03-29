import { Model, Sequelize, Options, DataTypes } from 'sequelize'
import inflection from 'inflection'
import {
  ScaffoldModel,
  SequelizeModelsCollection,
  ScaffoldSymbolModel,
  ScaffoldModelCollection,
  Virtuals
} from '../types'
import { extendedSequelize } from './extended'
import { Scaffold } from '..'
import { IAssociation, ICreateScaffoldModel } from './types'

export function buildScaffoldModelObject(
  models: SequelizeModelsCollection
): ScaffoldModelCollection {
  const names = Object.keys(models)

  const result: ScaffoldModelCollection = {}
  names.forEach((name) => {
    result[name] = models[name][ScaffoldSymbolModel]
  })
  return result
}

export function createSequelizeInstance(
  scaffold: Scaffold,
  options?: Options
): Sequelize {
  const ScaffoldSequelize = extendedSequelize(scaffold)

  if (!options) {
    return new ScaffoldSequelize('sqlite::memory:', {
      logging: false
    })
  }

  const sequelize: Sequelize = new ScaffoldSequelize(options)
  return sequelize
}

export function convertScaffoldModels(
  sequelize: Sequelize,
  models: ScaffoldModel[]
): ICreateScaffoldModel {
  const virtuals: Virtuals = {}

  models.forEach((model) => {
    for (const attributeKey in model.attributes) {
      const attribute = model.attributes[attributeKey]

      const { type, include } = attribute

      if (type instanceof DataTypes.VIRTUAL) {
        if (virtuals[model.name]) {
          virtuals[model.name][attributeKey] = include || ''
        } else {
          virtuals[model.name] = {
            [attributeKey]: include || ''
          }
        }

        include && delete attribute.include
      }
    }

    const temp = sequelize.define<Model<ScaffoldModel['attributes']>>(
      model.name,
      model.attributes,
      {
        validate: model.validation || {},
        underscored: true,
        createdAt: false,
        updatedAt: false,
        freezeTableName: true
      }
    )

    temp[ScaffoldSymbolModel] = model
  })

  const associationsLookup: Record<string, Record<string, IAssociation>> = {}

  models.forEach((model) => {
    const relationships = ['belongsTo', 'belongsToMany', 'hasOne', 'hasMany']

    relationships.forEach((relationship) => {
      // For each relationship type, check if we have definitions for it:
      if (model[relationship]) {
        // Grab the array of targets and options
        model[relationship].forEach(({ target, options }) => {
          if (!target || !sequelize.models[target]) {
            throw new Error(
              'Unknown Model association for ' +
                model.name +
                ' in ' +
                relationship
            )
          }

          // Pull the models off sequelize.models
          const current = sequelize.models[model.name]
          const associated = sequelize.models[target]

          // Create the relationship
          current[relationship](associated, options)

          //Get association name for lookup
          let associationName = options.as
          if (!associationName) {
            associationName = target.toLowerCase()
            if (relationship !== 'hasOne' && relationship !== 'belongsTo') {
              associationName = inflection.pluralize('target')
            }
          }

          // Add association details to a lookup for each model
          associationsLookup[model.name] = {
            ...associationsLookup[model.name],
            [associationName]: {
              type: relationship,
              model: target,
              key: options.foreignKey ?? `${model.name.toLowerCase()}_id`,
              joinTable:
                relationship === 'belongsToMany'
                  ? typeof options.through === 'string'
                    ? options.through
                    : options.through.model
                  : undefined
            }
          }
        })
      }
    })
  })

  return {
    associationsLookup,
    models: sequelize.models as SequelizeModelsCollection,
    virtuals
  }
}
