import { __mockApplication } from "../index";
import request from "supertest";
import http from "node:http";

import { Player } from "./models/ts/Player";
import { Team } from "./models/ts/Team";

describe("Demo", () => {
  beforeAll(() => {
    jest.setTimeout(60000);
  });

  it("should show some basic functionality", async () => {
    // If this was an external application that uses Scaffold, this would
    // be what we import from the module. We pass in our models, and it gives us back
    // a Koa app ready to go.
    const server = await __mockApplication([Player, Team]);

    console.log("Creating a new Team");
    const result1 = await request(server)
      .post("/api/Team")
      .set("authorization", "test")
      .send({
        name: "Team " + new Date(),
      });
    // Expect us to get a proper created result back
    expect(result1.statusCode).toBe(201);

    console.log("Creating a new Player");
    const result2 = await request(server)
      .post("/api/Player")
      .set("authorization", "test")
      .send({
        firstName: "First Name" + new Date(),
        lastName: "Last Name" + new Date(),
      });

    // Expect us to get a proper created result back
    expect(result2.statusCode).toBe(201);

    console.log("Getting the list of Players");
    const result3 = await request(server)
      .get("/api/Player")
      .set("authorization", "test");
    expect(result3.status).toBe(200);

    const jsonResult1 = JSON.parse(result3.text);
    expect(jsonResult1.data).toBeTruthy();
    expect(jsonResult1.data).toHaveLength(1);

    console.log("Getting the list of Teams");
    const result4 = await request(server)
      .get("/api/Team")
      .set("authorization", "test");
    expect(result4.status).toBe(200);

    const jsonResult2 = JSON.parse(result4.text);
    expect(jsonResult2.data).toBeTruthy();
    expect(jsonResult2.data).toHaveLength(1);
  });
});
