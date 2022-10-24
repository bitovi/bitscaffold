const { DataTypes } = require("sequelize");

const Team = {
  name: "Team",
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
  },

  hasMany: [{ target: "Player" }],
};

module.exports = Team;
