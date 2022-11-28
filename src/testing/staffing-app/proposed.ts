
// Import a top level function from scaffold (this would act like everything.[model].findAll)
import { findAll } from "@bitoi/scaffold/backend";
import { Assignment } from "./models/Assignment";

// Make a call to top level findAll passing the Model
const result = await findAll(Assignment);
// do something with the list of results...
res.send(result);
