import {
  createScaffoldApplication,
  startScaffoldApplication,
} from "../../exports";
import { Player, Team } from "./schema/Example";

async function init() {
  console.log("Creating Scaffold Application");
  const app = await createScaffoldApplication([Player, Team]);

  console.log("Starting Scaffold Application");
  await startScaffoldApplication(app, 3000);

  console.log("Started on port 3000");
}

init();
