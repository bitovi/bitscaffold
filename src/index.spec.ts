import { Scaffold } from "./index";
import Koa from "koa";
import KoaRouter from "@koa/router";
import { ScaffoldSymbolModel, DataTypes, ScaffoldModel } from "./types";
import { createServer, GET, DELETE, POST, PUT } from "./testing/utils";

describe("Initial Tests", () => {
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

  it("should test url is valid scaffold shape", async () => {
    const scaffold = new Scaffold([Model], { prefix: "/api" });

    // Test expected good paths
    expect(scaffold.isValidScaffoldRoute("GET", "/api/Model/1")).toBe(true);
    expect(
      scaffold.isValidScaffoldRoute("GET", "/api/Model/1?params=true")
    ).toBe(true);
    expect(scaffold.isValidScaffoldRoute("GET", "/api/Model")).toBe(true);

    // Test expected bad paths
    expect(scaffold.isValidScaffoldRoute("GET", "/api/Unknown")).toBe(false);
    expect(scaffold.isValidScaffoldRoute("GET", "/api/Unknown/1")).toBe(false);

    await scaffold.orm.close();
  });

  it("should test valid scaffold model in url", async () => {
    const scaffold = new Scaffold([Model], { prefix: "/api" });

    // Test expected good paths
    expect(scaffold.getScaffoldModelNameForRoute("/api/Model/1")).toBe("Model");
    expect(
      scaffold.getScaffoldModelNameForRoute("/api/Model/1?params=true")
    ).toBe("Model");
    expect(scaffold.getScaffoldModelNameForRoute("/api/Model")).toBe("Model");

    // Test expected bad paths
    expect(scaffold.getScaffoldModelNameForRoute("/api/Unknown")).toBe(false);
    expect(scaffold.getScaffoldModelNameForRoute("/api/Unknown/1")).toBe(false);

    await scaffold.orm.close();
  });

  it("should test the existance of scaffold symbol on models", async () => {
    const scaffold = new Scaffold([Model], { prefix: "/api" });

    const model2 = scaffold.model.Model[ScaffoldSymbolModel];
    expect(model2).toBeTruthy();
    expect(model2).toHaveProperty("attributes");
    expect(model2).toHaveProperty("name");

    await scaffold.orm.close();
  });

  it("should handle default read all operations", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.handleEverythingKoaMiddleware());

    const server = createServer(app);
    await scaffold.createDatabase();

    const findall = await GET(server, "/api/Model");

    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.json).toHaveProperty("length");
    expect(findall.json.length).toBe(0);

    await scaffold.orm.close();
  });

  it("should handle default read one not found operations", async () => {
    const app = new Koa();
    const scaffold = new Scaffold([Model], { prefix: "/api" });
    app.use(scaffold.handleEverythingKoaMiddleware());

    const server = createServer(app);
    await scaffold.createDatabase();
    const find = await GET(server, "/api/Model?id=1");

    expect(find).toBeTruthy();
    expect(find.status).toBe(204); // No Content
    expect(find.text).toBeFalsy();
    expect(find.json).toBeFalsy();

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
    expect(create.json).toHaveProperty("id");

    const find = await GET(server, "/api/Model?id=" + create.json.id);

    expect(find).toBeTruthy();
    expect(find.status).toBe(200);
    expect(find.json).toBeTruthy();
    console.log(find.json);

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
    expect(create.json).toHaveProperty("id");

    const findall = await GET(server, "/api/Model");

    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.json).toHaveProperty("length");
    expect(findall.json.length).toBe(1);

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
    expect(create.json).toHaveProperty("id");

    const update = await PUT(server, "/api/Model/" + create.json.id, {
      firstName: "newFirstName",
      lastName: "newLastName",
    });
    expect(update).toBeTruthy();
    expect(update.status).toBe(200);

    const findall = await GET(server, "/api/Model");

    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.json).toHaveProperty("length");
    expect(findall.json.length).toBe(1);

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
    expect(create.json).toHaveProperty("id");

    const findall1 = await GET(server, "/api/Model");

    expect(findall1).toBeTruthy();
    expect(findall1.status).toBe(200);
    expect(findall1.json).toHaveProperty("length");
    expect(findall1.json.length).toBe(1);

    const update = await DELETE(server, "/api/Model?id=" + create.json.id);
    expect(update).toBeTruthy();
    expect(update.status).toBe(200);

    const findall2 = await GET(server, "/api/Model");

    expect(findall2).toBeTruthy();
    expect(findall2.status).toBe(200);
    expect(findall2.json).toHaveProperty("length");
    expect(findall2.json.length).toBe(0);

    await scaffold.orm.close();
  });

  it("should handle custom user routes", async () => {
    const app = new Koa();
    const router = new KoaRouter();

    const scaffold = new Scaffold([Model], { prefix: "/api" });

    const server = createServer(app);
    await scaffold.createDatabase();

    router.get("/user-custom-route", async (ctx) => {
      ctx.body = { test: true };
    });

    router.get("/alternative-model", scaffold.middleware.Model.findAll);

    router.get("/alternative-model-2", async (ctx) => {
      const response = await scaffold.everything.Model.findAll(ctx.query);
      ctx.body = { test: true, data: response };
    });

    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(scaffold.handleEverythingKoaMiddleware());

    // Add a fallthrough default handler that just returns not found
    app.use((ctx) => {
      ctx.body = { error: true };
      ctx.status = 404;
    });

    const req1 = await GET(server, "/user-custom-route");
    expect(req1).toBeTruthy();
    expect(req1.status).toBe(200);
    expect(req1.json).toHaveProperty("test");

    const req2 = await GET(server, "/alternative-model");
    expect(req2).toBeTruthy();
    expect(req2.status).toBe(200);
    expect(req2.json).toHaveProperty("length");

    const req3 = await GET(server, "/alternative-model-2");
    expect(req3).toBeTruthy();
    expect(req3.status).toBe(200);
    expect(req3.json).toHaveProperty("test");
    expect(req3.json).toHaveProperty("data");

    const req4 = await GET(server, "/unknown-route-404");
    expect(req4).toBeTruthy();
    expect(req4.status).toBe(404);

    await scaffold.orm.close();
  });

  it("should handle custom user auth example", async () => {
    const app = new Koa();
    const router = new KoaRouter();

    const scaffold = new Scaffold([Model], { prefix: "/api" });

    const server = createServer(app);
    await scaffold.createDatabase();

    router.get(
      "/alternative-model",
      async (ctx, next) => {
        if (!ctx.headers.authorization) {
          return ctx.throw(401, "Bad Auth");
        }

        await next();
      },
      scaffold.middleware.Model.findAll
    );

    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(scaffold.handleEverythingKoaMiddleware());

    // Add a fallthrough default handler that just returns not found
    app.use((ctx) => {
      ctx.body = { error: true };
      ctx.status = 404;
    });

    const req2 = await GET(server, "/alternative-model");
    expect(req2).toBeTruthy();
    expect(req2.status).toBe(200);
    expect(req2.json).toHaveProperty("length");

    await scaffold.orm.close();
  });

  it("should handle custom user auth missing header", async () => {
    const app = new Koa();
    const router = new KoaRouter();

    const scaffold = new Scaffold([Model], { prefix: "/api" });

    const server = createServer(app);
    await scaffold.createDatabase();

    router.get(
      "/alternative-model",
      async (ctx, next) => {
        if (!ctx.headers.customheader) {
          return ctx.throw(401, "Bad Auth");
        }

        await next();
      },
      scaffold.middleware.Model.findAll
    );

    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(scaffold.handleEverythingKoaMiddleware());

    // Add a fallthrough default handler that just returns not found
    app.use((ctx) => {
      ctx.body = { error: true };
      ctx.status = 404;
    });

    const req2 = await GET(server, "/alternative-model");
    expect(req2).toBeTruthy();
    expect(req2.status).toBe(401);

    await scaffold.orm.close();
  });
});
