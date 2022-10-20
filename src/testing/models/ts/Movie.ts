import { Sequelize, Model, DataTypes } from "sequelize";

export default class Movie extends Model {
  static initModel(sequelize: Sequelize) {
    Movie.init(
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

  static initAssociations(sequelize: Sequelize) {
    Movie.belongsToMany(sequelize.models.Actor, { through: "ActorMovies" });
  }
}
