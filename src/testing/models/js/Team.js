const { DataTypes } = require("sequelize");
const { ScaffoldModelBase } = require("../../../types");

class Team extends ScaffoldModelBase {
  attributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: DataTypes.STRING,
    };
  }

  hasMany(models) {
    return [{ target: models.Player }];
  }
}

module.exports = Team;
