import { Scaffold } from "../../exports";
import { Player, Team } from "./schema/Example";

async function init() {
  console.log("Creating Scaffold Application");
  const scaffold = new Scaffold([Player, Team], {});
  console.log("Started on port 3000");
}

init();
