import { Sequelize, DataTypes } from "sequelize";
import signale from "signale";

describe("Sequelize Tests", () => {
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

  it("should show an example of async model validators", async () => {
    const ValidatorModel = sequelize.define(
      "ValidatorModel",
      {
        startDate: DataTypes.DATE,
        endDate: DataTypes.DATE,
      },
      {
        validate: {
          async startDateBeforeEndDate() {
            if (
              this.startDate &&
              this.endDate &&
              this.startDate >= this.endDate
            ) {
              throw new Error("START_DATE_MUST_BE_BEFORE_END_DATE");
            }
          },
          async endDateAfterStartDate() {
            if (
              this.startDate &&
              this.endDate &&
              this.startDate >= this.endDate
            ) {
              throw new Error("START_DATE_MUST_BE_BEFORE_END_DATE");
            }
          },
        },
      }
    );

    const temp = ValidatorModel.build({
      startDate: new Date("2021-05-22"),
      endDate: new Date("2020-05-22"),
    });

    try {
      await temp.validate();
      expect(false).toBe(true);
    } catch (err) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(err.message).toContain("START_DATE_MUST_BE_BEFORE_END_DATE");
    }
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
