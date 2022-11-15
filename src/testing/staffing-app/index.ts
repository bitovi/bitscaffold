import { Scaffold } from "../../exports";
import path from "path";
import Koa, { Context } from "koa";
import signale from "signale";
import KoaRouter from "@koa/router";

import { Assignment } from "./models/Assignment";
import { Employee } from "./models/Employee";
import { Project } from "./models/Project";
import { Role } from "./models/Role";
import { Skill } from "./models/Skill";

// Create a basic Koa application
const app = new Koa();
const router = new KoaRouter();

// Create a Scaffold instance containing your Models
const scaffold = new Scaffold([Assignment, Employee, Project, Role, Skill], {
  prefix: "/api",
  sync: true,
  database: {
    dialect: "sqlite",
    storage: path.join(__dirname, "..", "example.sqlite"),
  },
});

// Set up your Koa app as normal, for example, a logging middleware
app.use(async (ctx, next) => {
  signale.info("Incoming Request: ", ctx.method, ctx.path);
  await next();
});

router.get("/employee", async (ctx: Context) => {
  const params = await scaffold.parse.Employee.findAll(ctx.params);
  const result = await scaffold.model.Employee.findAll(params);
  const response = await scaffold.serialize.Employee.findAll(result);
  ctx.body = response;
});

// Hook up the router
app.use(router.routes());
app.use(router.allowedMethods());

// Attach the Scaffold default middleware to your Koa application
app.use(scaffold.handleEverythingKoaMiddleware());

// Set up any other Koa routes, middleware, etc, that you want.
app.use(async (ctx) => {
  ctx.body = { response: "Default Router Hit" };
});

// Start the Koa app listening
app.listen(3000, () => {
  console.log("Started on port 3000");
});
