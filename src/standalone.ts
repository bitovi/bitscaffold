import { init, start } from ".";
import { Team } from "./sequelize/models/Team.model"
import { Player } from "./sequelize/models/Player.model"

init([Team, Player]).then((app) => {
    start(app);
});

// init('test/fixtures/test-json-schema/schema-One2One.bitscaffold').then((app) => {
//     start(app);
// });

// init('test/fixtures/test-json-schema/schema-One2Many.bitscaffold').then((app) => {
//     start(app);
// });

// init('test/fixtures/test-json-schema/schema-Many2Many.bitscaffold').then((app) => {
//     start(app);
// });
