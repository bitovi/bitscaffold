import { Model, DataTypes, Sequelize } from "sequelize"

export class Player extends Model {
    static initModel(sequelize: Sequelize): typeof Player {
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
        return Player;
    }

    static initAssociate(models: Sequelize["models"]) {
        Player.belongsTo(models.Team);
    }
}