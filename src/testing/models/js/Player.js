const { DataTypes } = require("sequelize");
const { ScaffoldModelBase } = require("../../../types");

class Player extends ScaffoldModelBase {
  attributes() {
    return {
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
    };
  }

  belongsTo(models) {
    return [{ target: models.Team }];
  }
}

module.exports = Player;
