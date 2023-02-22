import { Scaffold } from "./index";
import Koa from "koa";
import { DataTypes, ScaffoldModel } from "./types";
import { createServer, GET, POST } from "./testing/utils";
import { Serializer } from "jsonapi-serializer";

describe("JSON:API Tests", () => {
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

  function serialize(data) {
    const serializer = new Serializer("Model", {
      keyForAttribute: "snake_case",
      attributes: Object.keys(data),
    });
    const serial = serializer.serialize(data);
    return serial;
  }

  it("should handle JSON:API create body", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.middleware.allModels.all);

    const server = createServer(app);
    await scaffold.createDatabase();

    await POST(
      server,
      "/api/Model",
      serialize({
        firstName: "firstName",
        lastName: "lastName",
      }),
      "application/vnd.api+json"
    );

    const create = await POST(
      server,
      "/api/Model",
      serialize({
        firstName: "firstName2",
        lastName: "lastName2",
      }),
      "application/vnd.api+json"
    );

    await POST(
      server,
      "/api/Model",
      serialize({
        firstName: "firstName3",
        lastName: "lastName3",
      }),
      "application/vnd.api+json"
    );

    expect(create).toBeTruthy();
    expect(create.status).toBe(200);
    expect(create.deserialized).toHaveProperty("id");
    expect(create.deserialized.id).toBeTruthy();

    const find = await GET(server, "/api/Model/" + create.deserialized.id);

    expect(find).toBeTruthy();
    expect(find.status).toBe(200);
    expect(find.deserialized).toBeTruthy();
    expect(find.deserialized.id).toBe(create.deserialized.id);

    await scaffold.orm.close();
  });
});
