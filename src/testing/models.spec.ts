import { createServer, DELETE, GET, POST } from "./utils";
import { Scaffold } from "../index";

import { Player } from "./models/ts/Player";
import { Team } from "./models/ts/Team";
import { Movie } from "./models/ts/Movie";
import { Actor } from "./models/ts/Actor";
import { Bar } from "./models/ts/Bar";
import { Foo } from "./models/ts/Foo";

describe("Model Tests", () => {
  beforeAll(() => {
    jest.setTimeout(60000);
  });

  it("One-To-One Testing", async () => {
    const scaffold = new Scaffold([Bar, Foo], { prefix: "/api" });
    await scaffold.createDatabase();
    const server = createServer(scaffold);

    console.log("Creating a new Foo");
    const result1 = await POST(server, "/api/Foo", {
      name: "Foo " + new Date(),
    });

    // Expect us to get a proper created result back
    expect(result1.status).toBe(201);

    console.log("Creating a new Bar");
    const result2 = await POST(server, "/api/Bar", {
      FooId: 1,
      BazId: 1,
      name: "Bar " + new Date(),
    });

    // Expect us to get a proper created result back
    expect(result2.status).toBe(201);

    console.log("Getting the list of Foos");
    const result3 = await GET(server, "/api/Foo");
    expect(result3.status).toBe(200);

    const jsonResult1 = JSON.parse(result3.text);
    expect(jsonResult1.data).toBeTruthy();
    expect(jsonResult1.data).toHaveLength(1);
  });

  it("One-To-Many Testing", async () => {
    const scaffold = new Scaffold([Player, Team], { prefix: "/api" });
    await scaffold.createDatabase();
    const server = createServer(scaffold);

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
      startDate: new Date("2021-05-22"),
      endDate: new Date("2025-05-22"),
      email: "email" + Date.now() + "@email.com",
      age: 25,
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

  it.skip("Many-To-Many Testing", async () => {
    const scaffold = new Scaffold([Movie, Actor], { prefix: "/api" });
    await scaffold.createDatabase();
    const server = createServer(scaffold);

    console.log("Creating a new Movie");
    const result1 = await POST(server, "/api/Movie", {
      name: "Team " + new Date(),
    });

    // Expect us to get a proper created result back
    expect(result1.status).toBe(201);

    console.log("Creating a new Actor 1");
    const result2 = await POST(server, "/api/Actor", {
      Movies: [{ id: 1 }],
      name: "Name" + new Date(),
    });

    // Expect us to get a proper created result back
    expect(result2.status).toBe(201);

    console.log("Creating a new Actor 2");
    const result3 = await POST(server, "/api/Actor", {
      Movies: [{ id: 1 }],
      name: "Name" + new Date(),
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

  it("Create and Delete a Record", async () => {
    const scaffold = new Scaffold([Player, Team], { prefix: "/api" });
    await scaffold.createDatabase();
    const server = createServer(scaffold);

    console.log("Creating a new Team");
    const result1 = await POST(server, "/api/Team", {
      name: "Team " + new Date(),
    });

    // Expect us to get a proper created result back
    expect(result1.status).toBe(201);
    let userId = 0;

    userId = userId + 1;
    console.log("Creating a new Player", userId);
    const result2 = await POST(server, "/api/Player", {
      TeamId: 1,
      firstName: "First Name" + userId,
      lastName: "Last Name" + userId,
      startDate: new Date("2021-06-22"),
      endDate: new Date("2025-06-22"),
      email: "email" + userId + "@email.com",
      age: 25,
    });

    userId = userId + 1;
    console.log("Creating a new Player", userId);
    await POST(server, "/api/Player", {
      TeamId: 1,
      firstName: "First Name" + userId,
      lastName: "Last Name" + userId,
      startDate: new Date("2021-06-22"),
      endDate: new Date("2025-06-22"),
      email: "email" + userId + "@email.com",
      age: 25,
    });

    userId = userId + 1;
    console.log("Creating a new Player", userId);
    await POST(server, "/api/Player", {
      TeamId: 1,
      firstName: "First Name" + userId,
      lastName: "Last Name" + userId,
      startDate: new Date("2021-06-22"),
      endDate: new Date("2025-06-22"),
      email: "email" + userId + "@email.com",
      age: 25,
    });

    userId = userId + 1;
    console.log("Creating a new Player", userId);
    await POST(server, "/api/Player", {
      TeamId: 1,
      firstName: "First Name" + userId,
      lastName: "Last Name" + userId,
      startDate: new Date("2021-06-22"),
      endDate: new Date("2025-06-22"),
      email: "email" + userId + "@email.com",
      age: 25,
    });

    // Expect us to get a proper created result back
    expect(result2.status).toBe(201);

    console.log("Getting the list of Players");
    const result3 = await GET(server, "/api/Player");
    expect(result3.status).toBe(200);

    const jsonResult1 = JSON.parse(result3.text);
    expect(jsonResult1.data).toBeTruthy();
    expect(jsonResult1.data).toHaveLength(4);

    console.log("Getting the list of Teams, with Players");
    const result4 = await GET(server, "/api/Team");
    expect(result4.status).toBe(200);

    // Make sure that we got the one Team back that we created
    expect(result4.json.data).toBeTruthy();
    expect(result4.json.data).toHaveLength(1);

    // Make sure that the Team we created has four Players associated with it
    expect(result4.json.data[0].players).toBeTruthy();
    expect(result4.json.data[0].players).toHaveLength(4);

    // Delete a Player Record
    const result5 = await DELETE(server, "/api/Player/" + result2.json.data.id);
    expect(result5.status).toBe(200);

    console.log("Getting the list of Teams, with Players");
    const result6 = await GET(server, "/api/Team");
    expect(result6.status).toBe(200);

    // Make sure that we got the one Team back that we created
    expect(result6.json.data).toBeTruthy();
    expect(result6.json.data).toHaveLength(1);

    // Make sure that the Team we created has a 3 Players associated with it
    expect(result6.json.data[0].players).toBeTruthy();
    expect(result6.json.data[0].players).toHaveLength(3);
  });
});
