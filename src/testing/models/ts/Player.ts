import { Sequelize, Model, DataTypes } from "sequelize";

export default class Player extends Model {
    static initModel(sequelize: Sequelize) {
        Player.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            startDate: DataTypes.DATE,
            endDate: DataTypes.DATE
        }, { sequelize, createdAt: false, updatedAt: false })
    }

    static initAssociations(sequelize: Sequelize) {
        Player.belongsTo(sequelize.models.Team);
    }
}