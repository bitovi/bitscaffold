const { DataTypes } = require("sequelize");

const Player = {
  name: "Player",
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  },

  belongsTo(models) {
    return [{ target: models.Team }];
  },
};

module.exports = Player;
