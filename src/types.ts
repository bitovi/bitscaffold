import { DataTypes } from "sequelize"

export interface BitScaffoldValidator {
    lt?: string,
    gt?: string,
    eq?: string
}

export interface BitScaffoldField {
    type: string,
    primary?: boolean,
    default?: string,
    validate: BitScaffoldValidator
}

export interface BitScaffoldModel {
    [FieldName: string]: BitScaffoldField
}

export interface BitScaffoldSchema {
    models: {
        [ModelName: string]: BitScaffoldModel
    }
    validation: {
        [ModelName: string]: any
    }
    config: any
}

export const BitDataTypes = DataTypes;