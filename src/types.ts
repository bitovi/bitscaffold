import { Context } from "koa"
import { DataTypes, ModelStatic, Model, Sequelize } from "sequelize"
import signale, { Signale } from "signale";

export interface ScaffoldModelContext extends ScaffoldContext {
    state: ScaffoldContext['state'] & {
        model: ModelStatic<Model>
    }
}

export interface ScaffoldContext extends Context {
    state: Context['state'] & {
        logger: signale
    }
    database: Sequelize,
    models: { [ModelName: string]: ModelStatic<Model> }
}


export interface BitScaffoldValidator {
    lt?: string,
    gt?: string,
    eq?: string
    regex?: string
}

export interface BitScaffoldValidatorContext {
    [FieldName: string]: BitScaffoldValidator | false
}

export interface BitScaffoldField {
    type: string
    primary?: boolean
    default?: string
    autoIncrement?: boolean
    required?: boolean
}

export interface BitScaffoldRelation {
    from?: string
    to?: string
    through?: string
}

interface HasManyAssociation {
    model: string,
    as: string
}

interface BelongsToManyAssociation {
    model: string,
    through: string
}

export interface BitScaffoldModel {
    name?: string,
    fields: { [FieldName: string]: BitScaffoldField }
    validations?: { [FieldName: string]: BitScaffoldValidator }
    hasOne?: string
    hasMany?: string | HasManyAssociation
    belongsTo?: string
    belongsToMany?: BelongsToManyAssociation
}

export interface BitScaffoldSchema {
    models: {
        [ModelName: string]: BitScaffoldModel
    }
}

export const BitDataTypes = DataTypes;