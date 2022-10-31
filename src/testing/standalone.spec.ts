import { Scaffold } from "../libs";

import { Player } from "./models/ts/Player";
import { Team } from "./models/ts/Team";

import PlayerJS from "./models/js/Player";
import TeamJS from "./models/js/Team";

describe("Standalone Scaffold", () => {
  it("should handle creating a Scaffold app with typescript models", async () => {
    const app = new Scaffold([Player, Team], {});
    expect(app).toBeTruthy();
  });

  it("should handle creating a Scaffold app with javascript models", async () => {
    const app = new Scaffold([PlayerJS, TeamJS], {});
    expect(app).toBeTruthy();
  });
});
