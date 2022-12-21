import { ScaffoldModel, DataTypes } from "../../../types";

export const App: ScaffoldModel = {
    name: "App",
    attributes: {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('UP', 'DOWN', 'MAINTENANCE')
        },
        port: {
            type: DataTypes.ENUM('CLOUD', 'LOCAL'),
            allowNull: false
        },
        endpoint: {
            type: DataTypes.STRING,
            allowNull: false
        },
        environment: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    belongsTo: [{ target: "User", options: { as: 'owner' } }],
    hasMany: [{ target: "Host", options: { as: "hosts" } }],
};

export const User: ScaffoldModel = {
    name: "User",
    attributes: {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }
};

export const Host: ScaffoldModel = {
    name: "Host",
    attributes: {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        hostname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        datacenter: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    belongsTo: [{ target: 'App' }]
};