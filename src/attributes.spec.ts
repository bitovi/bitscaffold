import { Scaffold } from "./index";
import Koa from "koa";
import { DataTypes, ScaffoldModel } from "./types";
import { createServer, GET, POST } from "./testing/utils";

describe("Attribute Tests", () => {
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

  it("should create a record and fetch specific attributes", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.middleware.allModels.all);

    const server = createServer(app);
    await scaffold.createDatabase();

    const create = await POST(server, "/api/Model", {
      firstName: "firstName",
      lastName: "lastName",
    });

    expect(create).toBeTruthy();
    expect(create.status).toBe(200);
    expect(create.deserialized).toHaveProperty("id");

    const find1 = await GET(
      server,
      "/api/Model/" + create.deserialized.id + "?fields[Model]=firstName"
    );

    expect(find1).toBeTruthy();
    expect(find1.status).toBe(200);
    expect(find1.serialized.data).toBeTruthy();
    expect(find1.deserialized).toHaveProperty("firstName");
    expect(find1.deserialized).not.toHaveProperty("lastName");

    const find2 = await GET(
      server,
      "/api/Model/" + create.deserialized.id + "?fields[Model]=lastName"
    );

    expect(find2).toBeTruthy();
    expect(find2.status).toBe(200);
    expect(find2.serialized.data).toBeTruthy();
    expect(find2.deserialized).not.toHaveProperty("firstName");
    expect(find2.deserialized).toHaveProperty("lastName");

    await scaffold.orm.close();
  });

  it("should create a record and error when fetching unknown attributes", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.middleware.allModels.all);

    const server = createServer(app);
    await scaffold.createDatabase();

    const create = await POST(server, "/api/Model", {
      firstName: "firstName",
      lastName: "lastName",
    });

    expect(create).toBeTruthy();
    expect(create.status).toBe(200);
    expect(create.deserialized).toHaveProperty("id");

    const find1 = await GET(
      server,
      "/api/Model/" + create.deserialized.id + "?fields[Model]=badAttribute"
    );

    expect(find1).toBeTruthy();
    expect(find1.status).not.toBe(200);

    await scaffold.orm.close();
  });

  it("should create several record and fetch all with specific attributes", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.middleware.allModels.all);

    const server = createServer(app);
    await scaffold.createDatabase();

    await POST(server, "/api/Model", {
      firstName: "firstName1",
      lastName: "lastName1",
    });

    await POST(server, "/api/Model", {
      firstName: "firstName2",
      lastName: "lastName2",
    });

    await POST(server, "/api/Model", {
      firstName: "firstName3",
      lastName: "lastName3",
    });

    const find1 = await GET(server, "/api/Model/?fields[Model]=firstName");

    expect(find1).toBeTruthy();
    expect(find1.status).toBe(200);
    expect(find1.deserialized).toHaveProperty("length");
    expect(find1.deserialized.length).toBe(3);

    find1.deserialized.forEach((entry) => {
      expect(entry).toHaveProperty("firstName");
      expect(entry).not.toHaveProperty("lastName");
    });

    const find2 = await GET(server, "/api/Model/?fields[Model]=lastName");

    expect(find2).toBeTruthy();
    expect(find2.status).toBe(200);
    expect(find2.deserialized).toHaveProperty("length");
    expect(find2.deserialized.length).toBe(3);

    find2.deserialized.forEach((entry) => {
      expect(entry).toHaveProperty("lastName");
      expect(entry).not.toHaveProperty("firstName");
    });

    await scaffold.orm.close();
  });
});
