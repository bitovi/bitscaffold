import { Sequelize, DataTypes } from "sequelize";
import signale from "signale";

describe("Relationship Tests", () => {
  let sequelize: Sequelize;
  beforeAll(async () => {
    sequelize = new Sequelize("sqlite::memory:", {
      logging: (message) => {
        signale.info("  SQL:", message);
      },
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should show an example of One-To-One", async () => {
    const Foo = sequelize.define("Foo", {});
    const Bar = sequelize.define("Bar", {});

    Foo.hasOne(Bar, {
      foreignKey: "fooId",
    });

    Bar.belongsTo(Foo);

    expect(Foo.associations["Bar"]).toBeTruthy();
    expect(Bar.associations["Foo"]).toBeTruthy();
  });

  it("should show an example of One-To-Many", () => {
    const Player = sequelize.define("Player", {});
    const Team = sequelize.define("Team", {});

    Team.hasMany(Player, {
      foreignKey: "teamId",
    });

    Player.belongsTo(Team);

    expect(Player.associations["Team"]).toBeTruthy();
    expect(Team.associations["Players"]).toBeTruthy();
  });

  it("should show an example of Many-To-Many", () => {
    const Movie = sequelize.define("Movie", { name: DataTypes.STRING });
    const Actor = sequelize.define("Actor", { name: DataTypes.STRING });

    Movie.belongsToMany(Actor, { through: "ActorMovies" });

    Actor.belongsToMany(Movie, { through: "ActorMovies" });

    expect(Movie.associations["Actors"]).toBeTruthy();
    expect(Actor.associations["Movies"]).toBeTruthy();
  });
});
