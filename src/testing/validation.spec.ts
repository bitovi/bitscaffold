import { __mockApplication } from "../index";
import { POST, PUT } from "./utils";
import http from "node:http";

import { Player } from "./models/ts/Player";
import { Team } from "./models/ts/Team";

describe("Validation Tests", () => {
  beforeAll(() => {
    jest.setTimeout(60000);
  });

  it("should fail validtion if there are extra properties", async () => {
    const server = await __mockApplication([Player, Team]);

    console.log("Creating a new Player");
    const result2 = await POST(server, "/api/Player", {
      firstName: "First Name",
      lastName: "Last Name",
      middleName: "Unknown Extra Field",
      startDate: new Date("2021-06-22"),
      endDate: new Date("2025-06-22"),
      email: "email@email.com",
      age: 25
    });

    // Expect us to get a proper created result back
    expect(result2.status).toBe(400);
    expect(result2.json.errors).toHaveLength(1);
    expect(result2.json.errors[0]).toContain("middleName");
  });

  it("should fail validtion if startDate > endDate", async () => {
    const server = await __mockApplication([Player, Team]);

    console.log("Creating a new Player");
    const result2 = await POST(server, "/api/Player", {
      firstName: "First Name",
      lastName: "Last Name",
      startDate: new Date("2022-06-22"),
      endDate: new Date("2021-06-22"),
      email: "email@email.com",
      age: 25
    });

    expect(result2.status).toBe(400);
    expect(result2.json.errors).toHaveLength(1);
  });

  it("should fail validtion create and then update invalid", async () => {
    const server = await __mockApplication([Player, Team]);

    console.log("Creating a new Player");
    const result1 = await POST(server, "/api/Player", {
      firstName: "First Name",
      lastName: "Last Name",
      startDate: new Date("2021-06-22"),
      email: "email@email.com",
      age: 25
    });

    expect(result1.status).toBe(201);

    console.log("Updating an existing Player");

    const result2 = await PUT(server, "/api/Player/" + result1.json.data.id, {
      endDate: new Date("2020-05-22"),
    });

    expect(result2.status).toBe(400);
    expect(result2.json.errors).toHaveLength(1);
  });

  it("should pass validtion create and then update valid", async () => {
    const server = await __mockApplication([Player, Team]);

    console.log("Creating a new Player");
    const result1 = await POST(server, "/api/Player", {
      firstName: "First Name",
      lastName: "Last Name",
      startDate: new Date("2021-06-22"),
      email: "email@email.com",
      age: 25
    });

    expect(result1.status).toBe(201);

    console.log("Updating an existing Player");

    const result2 = await PUT(server, "/api/Player/" + result1.json.data.id, {
      endDate: new Date("2026-10-22"),
    });

    expect(result2.status).toBe(200);
  });
});
