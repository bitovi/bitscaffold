
import { Sequelize, DataTypes } from "sequelize";
import signale from "signale";

describe("Relationship Tests", () => {
    it("should test different relationship types", async () => {
        const sequelize = new Sequelize('sqlite::memory:', {
            logging: (message) => {
                signale.info("  SQL:", message)
            }
        });

        // One-To-One relationship
        const Foo = sequelize.define('Foo', {});
        const Bar = sequelize.define('Bar', {});

        Foo.hasOne(Bar, {
            foreignKey: 'fooId'
        });

        Bar.belongsTo(Foo);


        // One-To-Many relationship
        const Player = sequelize.define('Player', {});
        const Team = sequelize.define('Team', {});

        Team.hasMany(Player, {
            foreignKey: 'teamId'
        });
        Player.belongsTo(Team);


        // Many-To-Many relationship
        const Movie = sequelize.define('Movie', { name: DataTypes.STRING });
        const Actor = sequelize.define('Actor', { name: DataTypes.STRING });

        Movie.belongsToMany(Actor, { through: 'ActorMovies' });
        Actor.belongsToMany(Movie, { through: 'ActorMovies' });

    });
})