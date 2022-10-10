import { DataTypes } from "sequelize"

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

export interface BitScaffoldModel {
    tableName: string,
    fields: { [FieldName: string]: BitScaffoldField }
    relationships?: {
        HasMany?: {
            [ModelName: string]: BitScaffoldRelation
        },
        HasOne?: {
            [ModelName: string]: BitScaffoldRelation
        },
        BelongsTo?: {
            [ModelName: string]: BitScaffoldRelation
        },
        BelongsToMany?: {
            [ModelName: string]: BitScaffoldRelation
        }
    },
    validations?: { [FieldName: string]: BitScaffoldValidator }
}

export interface BitScaffoldSchema {
    models: {
        [ModelName: string]: BitScaffoldModel
    }
}

export const BitDataTypes = DataTypes;