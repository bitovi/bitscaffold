import { Model, DataTypes, Sequelize } from "sequelize"

export class Team extends Model {
    static initModel(sequelize: Sequelize): typeof Team {
        Team.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: DataTypes.STRING
        }, { sequelize, createdAt: false, updatedAt: false })
        return Team;
    }

    static initAssociate(models: Sequelize["models"]) {
        Team.hasMany(models.Player, { as: "players" })
    }
}

