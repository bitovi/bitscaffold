const { DataTypes } = require("sequelize");

const Team = {
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
  },

  hasMany(models) {
    return [{ target: models.Player }];
  },
};

module.exports = Team;
