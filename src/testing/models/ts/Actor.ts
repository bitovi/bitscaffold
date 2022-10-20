import { Sequelize, Model, DataTypes } from "sequelize";

export default class Actor extends Model {
  static initModel(sequelize: Sequelize) {
    Actor.init(
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
    Actor.belongsToMany(sequelize.models.Movie, { through: "ActorMovies" });
  }
}
