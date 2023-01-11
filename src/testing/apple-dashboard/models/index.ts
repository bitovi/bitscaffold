import { Optional } from "sequelize";
import { ScaffoldModel, DataTypes, Model } from "../../../types";

type AppAttributes = {
    id: string;
    status: 'UP'|'DOWN'|'MAINTENANCE';
    healthyHosts: unknown;
    port: 'CLOUD'|'LOCAL';
    endpoint: string;
    environment: string;
}
type AppCreationAttributes = Optional<AppAttributes, 'id'>;

export const App: ScaffoldModel<Model<AppAttributes, AppCreationAttributes>> = {
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
        healthyHosts: {
            type: DataTypes.VIRTUAL,
            get() {
                // Can we tell it to get Hosts from the App Model (this?)
                return this.Hosts.status
            },
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


type UserAttributes = {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
}
type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export const User: ScaffoldModel<Model<UserAttributes, UserCreationAttributes>> = {
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
        },
        fullName: {
            type: DataTypes.VIRTUAL(DataTypes.STRING, ['firstName', 'lastName']),
            get() {
                return `${this.firstName} ${this.lastName}`
            }
        },
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
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    belongsTo: [{ target: 'App' }]
};