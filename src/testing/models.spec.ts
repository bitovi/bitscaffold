import { createScaffoldApplication } from "../index";
import request from "supertest";
import http from "node:http";

import PlayerTS from "./models/ts/Player";
import TeamTS from "./models/ts/Team";
import MovieTS from "./models/ts/Movie";
import ActorTS from "./models/ts/Actor";

describe("Model Tests", () => {
  beforeAll(() => {
    jest.setTimeout(60000);
  });

  it.skip("One-To-Many Testing", async () => {
    const app = await createScaffoldApplication([PlayerTS, TeamTS]);
    const server = http.createServer(app.callback());

    console.log("Creating a new Team");
    const result1 = await POST(server, "/api/Team", {
      name: "Team " + new Date(),
    });

    // Expect us to get a proper created result back
    expect(result1.status).toBe(201);

    console.log("Creating a new Player");
    const result2 = await POST(server, "/api/Player", {
      TeamId: 1,
      firstName: "First Name" + new Date(),
      lastName: "Last Name" + new Date(),
    });

    // Expect us to get a proper created result back
    expect(result2.status).toBe(201);

    console.log("Getting the list of Players");
    const result3 = await GET(server, "/api/Player");
    expect(result3.status).toBe(200);

    const jsonResult1 = JSON.parse(result3.text);
    expect(jsonResult1.data).toBeTruthy();
    expect(jsonResult1.data).toHaveLength(1);

    console.log("Getting the list of Teams, with Players");
    const result4 = await GET(server, "/api/Team");
    expect(result4.status).toBe(200);

    // Make sure that we got the one Team back that we created
    expect(result4.json.data).toBeTruthy();
    expect(result4.json.data).toHaveLength(1);

    // Make sure that the Team we created has a single Player associated with it
    expect(result4.json.data[0].players).toBeTruthy();
    expect(result4.json.data[0].players).toHaveLength(1);
  });

  it("Many-To-Many Testing", async () => {
    const app = await createScaffoldApplication([MovieTS, ActorTS]);
    const server = http.createServer(app.callback());

    console.log("Creating a new Movie");
    const result1 = await POST(server, "/api/Movie", {
      name: "Team " + new Date(),
    });

    // Expect us to get a proper created result back
    expect(result1.status).toBe(201);

    console.log("Creating a new Actor 1");
    const result2 = await POST(server, "/api/Actor", {
      Movies: [{ id: 1 }],
      firstName: "First Name" + new Date(),
      lastName: "Last Name" + new Date(),
    });

    // Expect us to get a proper created result back
    expect(result2.status).toBe(201);

    console.log("Creating a new Actor 2");
    const result3 = await POST(server, "/api/Actor", {
      Movies: [{ id: 1 }],
      firstName: "First Name" + new Date(),
      lastName: "Last Name" + new Date(),
    });

    // Expect us to get a proper created result back
    expect(result3.status).toBe(201);

    console.log("Getting the list of Actors");
    const result4 = await GET(server, "/api/Actor");
    expect(result4.status).toBe(200);

    const jsonResult1 = JSON.parse(result4.text);
    expect(jsonResult1.data).toBeTruthy();
    expect(jsonResult1.data).toHaveLength(2);

    console.log("Getting the list of Movies, with Actors");
    const result5 = await GET(server, "/api/Movie");
    expect(result5.status).toBe(200);

    // Make sure that we got the one Movie back that we created
    expect(result5.json.data).toBeTruthy();
    expect(result5.json.data).toHaveLength(1);

    // Make sure that the Movie we created has two Actors associated with it
    expect(result5.json.data[0].Actors).toBeTruthy();
    expect(result5.json.data[0].Actors).toHaveLength(2);
  });
});

async function GET(server, path) {
  const result = await request(server).get(path).set("authorization", "test");

  let json;
  try {
    json = JSON.parse(result.text);
  } catch (err) {
    console.error(result.text);
    throw err;
  }

  return {
    text: result.text,
    status: result.statusCode,
    json: json,
  };
}

async function POST(server, path, payload) {
  const result = await request(server)
    .post(path)
    .set("authorization", "test")
    .send(payload);

  let json;
  try {
    json = JSON.parse(result.text);
  } catch (err) {
    console.error(result.text);
    throw err;
  }

  return {
    text: result.text,
    status: result.statusCode,
    json: json,
  };
}
