
import { createScaffoldApplication } from "../index";
import request from "supertest";
import http from "node:http";

import PlayerTS from "./models/ts/Player";
import TeamTS from "./models/ts/Team"

import PlayerJS from "./models/js/Player";
import TeamJS from "./models/js/Team";


describe("Standalone Scaffold", () => {
    it("should handle creating a Scaffold app with typescript models", async () => {
        const app = await createScaffoldApplication([PlayerTS, TeamTS]);
        expect(app).toBeTruthy()
    });

    it("should handle creating a Scaffold app with javascript models", async () => {
        const app = await createScaffoldApplication([PlayerJS, TeamJS]);
        expect(app).toBeTruthy()
    });
})