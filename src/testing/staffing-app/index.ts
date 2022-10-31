import {
  Scaffold,
  scaffoldCreateDefaultMiddleware,
  scaffoldFindAllDefaultMiddleware,
} from "../../exports";
import Koa from "koa";
import signale from "signale";

import { Assignment } from "./models/Assignment";
import { Employee } from "./models/Employee";
import { Project } from "./models/Project";
import { Role } from "./models/Role";
import { Skill } from "./models/Skill";

console.log("Creating Scaffold Staffing Application, defaults");
const app = new Koa();

app.use(async (ctx, next) => {
  signale.info("Incoming Request: ", ctx.method, ctx.path);
  await next();
});

const scaffold = new Scaffold([Assignment, Employee, Project, Role, Skill], {
  prefix: "/api",
});

scaffold.custom.findAll(Skill, [
  customAuthMiddleware(),
  async (ctx, next) => {
    ctx.params.model = "Skill";
    await next();
  },
  scaffoldFindAllDefaultMiddleware(),
]);

scaffold.custom.route("get", "/custom/route", async (ctx, next) => {
  ctx.body = { response: "Hello Custom Route" };
});

app.use(scaffold.defaults());

app.use(async (ctx) => {
  ctx.body = { response: "Hello World" };
});

app.listen(3000, () => {
  console.log("Started on port 3000");
});

function customAuthMiddleware() {
  return async function customAuth(ctx, next) {
    signale.pending("customAuthMiddleware");
    if (!ctx.headers.authorization) {
      signale.error("customAuthMiddleware");
      throw new Error("Bad Custom Auth");
    }

    if (ctx.headers.authorization !== "custom") {
      signale.error("customAuthMiddleware");
      throw new Error("Bad Custom Auth");
    }
    signale.success("customAuthMiddleware");
    await next();
  };
}
