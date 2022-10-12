import { init, start } from ".";

init('test/fixtures/test-json-schema/schema.bitscaffold').then((app) => {
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
