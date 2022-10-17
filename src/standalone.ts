import { init, start } from ".";
import schema from "./schema";

init(schema).then((app) => {
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
