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
  belongsTo: [{ target: "Team" }],
};

module.exports = Player;
