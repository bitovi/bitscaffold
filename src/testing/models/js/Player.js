const { Model, DataTypes } = require("sequelize");

class Player extends Model {
    static initModel(sequelize) {
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

    static initAssociations(sequelize) {
        Player.belongsTo(sequelize.models.Team);
    }
}

module.exports = Player;