const { Model, DataTypes } = require("sequelize");

class Team extends Model {
  static initModel(sequelize) {
    Team.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: DataTypes.STRING,
      },
      { sequelize, createdAt: false, updatedAt: false }
    );
  }

  static initAssociations(sequelize) {
    Team.hasMany(sequelize.models.Player, { as: "players" });
  }
}

module.exports = Team;
