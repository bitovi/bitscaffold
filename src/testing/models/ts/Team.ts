import { Model, DataTypes, Sequelize } from "sequelize";

export default class Team extends Model {
    static initModel(sequelize: Sequelize) {
        Team.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: DataTypes.STRING
        }, { sequelize, createdAt: false, updatedAt: false })
    }

    static initAssociations(sequelize: Sequelize) {
        Team.hasMany(sequelize.models.Player, { as: "players" })
    }
}
