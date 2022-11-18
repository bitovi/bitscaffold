import { Scaffold } from "./index";
import Koa from "koa";
import { DataTypes, ScaffoldModel } from "./types";
import { createServer, GET, DELETE, POST, PUT } from "./testing/utils";

describe("Default Tests", () => {
  const Model: ScaffoldModel = {
    name: "Model",
    attributes: {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
  };

  it("should handle default read all operations", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.handleEverythingKoaMiddleware());

    const server = createServer(app);
    await scaffold.createDatabase();

    const findall = await GET(server, "/api/Model");

    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.deserialized).toHaveProperty("length");
    expect(findall.deserialized.length).toBe(0);

    await scaffold.orm.close();
  });

  it("should handle default read one not found operations", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.handleEverythingKoaMiddleware());

    const server = createServer(app);
    await scaffold.createDatabase();
    const find = await GET(server, "/api/Model/1");

    expect(find).toBeTruthy();
    expect(find.status).toBe(404);
    expect(find.text).toBe("Not Found");
    expect(find.deserialized).toBeFalsy();

    await scaffold.orm.close();
  });

  it("should handle default read one after create operations", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.handleEverythingKoaMiddleware());

    const server = createServer(app);
    await scaffold.createDatabase();

    const create = await POST(server, "/api/Model", {
      firstName: "firstName",
      lastName: "lastName",
    });

    expect(create).toBeTruthy();
    expect(create.status).toBe(200);
    expect(create.deserialized).toHaveProperty("id");

    const find = await GET(server, "/api/Model/" + create.deserialized.id);

    expect(find).toBeTruthy();
    expect(find.status).toBe(200);
    expect(find.deserialized).toBeTruthy();

    await scaffold.orm.close();
  });

  it("should handle default create operations", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.handleEverythingKoaMiddleware());

    const server = createServer(app);
    await scaffold.createDatabase();

    const create = await POST(server, "/api/Model", {
      firstName: "firstName",
      lastName: "lastName",
    });

    expect(create).toBeTruthy();
    expect(create.status).toBe(200);
    expect(create.deserialized).toHaveProperty("id");

    const findall = await GET(server, "/api/Model");

    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.deserialized).toHaveProperty("length");
    expect(findall.deserialized.length).toBe(1);

    await scaffold.orm.close();
  });

  it("should handle default update operations", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.handleEverythingKoaMiddleware());

    const server = createServer(app);
    await scaffold.createDatabase();

    const create = await POST(server, "/api/Model", {
      firstName: "firstName",
      lastName: "lastName",
    });
    expect(create).toBeTruthy();
    expect(create.status).toBe(200);
    expect(create.deserialized).toHaveProperty("id");

    const update = await PUT(server, "/api/Model/" + create.deserialized.id, {
      firstName: "newFirstName",
      lastName: "newLastName",
    });
    expect(update).toBeTruthy();
    expect(update.status).toBe(200);

    const findall = await GET(server, "/api/Model");

    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.deserialized).toHaveProperty("length");
    expect(findall.deserialized.length).toBe(1);

    await scaffold.orm.close();
  });

  it("should handle default delete operations", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.handleEverythingKoaMiddleware());

    const server = createServer(app);
    await scaffold.createDatabase();

    const create = await POST(server, "/api/Model", {
      firstName: "firstName",
      lastName: "lastName",
    });
    expect(create).toBeTruthy();
    expect(create.status).toBe(200);
    expect(create.deserialized).toHaveProperty("id");

    const findall1 = await GET(server, "/api/Model");

    expect(findall1).toBeTruthy();
    expect(findall1.status).toBe(200);
    expect(findall1.deserialized).toHaveProperty("length");
    expect(findall1.deserialized.length).toBe(1);

    const del = await DELETE(server, "/api/Model/" + create.deserialized.id);
    expect(del).toBeTruthy();
    expect(del.status).toBe(200);

    const findall2 = await GET(server, "/api/Model");

    expect(findall2).toBeTruthy();
    expect(findall2.status).toBe(200);
    expect(findall2.deserialized).toHaveProperty("length");
    expect(findall2.deserialized.length).toBe(0);

    await scaffold.orm.close();
  });
});
