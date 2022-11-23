import { Scaffold } from "../../exports";
import Koa, { Context } from "koa";
import signale from "signale";
import KoaRouter from "@koa/router";

import { Assignment } from "./models/Assignment";
import { Employee } from "./models/Employee";
import { Project } from "./models/Project";
import { Role } from "./models/Role";
import { Skill } from "./models/Skill";

export function createStaffingAppInstance(): [Koa, Scaffold] {
  // Create a basic Koa application
  const app = new Koa();
  const router = new KoaRouter();

  // Create a Scaffold instance containing your Models
  const scaffold = new Scaffold([Assignment, Employee, Project, Role, Skill], {
    prefix: "/api",
    expose: true,
  });

  // Set up your Koa app as normal, for example, a logging middleware
  app.use(async (ctx, next) => {
    signale.info("Incoming Request: ", ctx.method, ctx.path);
    await next();
  });

  router.get("/skill", async (ctx: Context) => {
    const params = await scaffold.parse.Skill.findAndCountAll(ctx.query);
    const result = await scaffold.model.Skill.findAndCountAll(params);
    const response = await scaffold.serialize.Skill.findAndCountAll(result);
    ctx.body = { customRouteTest1: true, data: response };
  });

  router.get("/skill2", async (ctx: Context) => {
    const response = await scaffold.everything.Skill.findAll(ctx.query);
    ctx.body = { customRouteTest2: true, data: response };
  });

  router.get("/skill3", scaffold.middleware.Skill.findAll);

  router.get(
    "/skill-special-auth",
    async (ctx, next) => {
      if (!ctx.headers.authorization) {
        return ctx.throw("This route requires authorization");
      }
      return await next();
    },
    scaffold.middleware.Skill.findAndCountAll
  );

  router.get("/test-special-thing/:model", scaffold.middleware.allModels.crud);

  // Hook up the router
  app.use(router.routes());
  app.use(router.allowedMethods());

  // app.use(scaffold.middleware.allModels);

  // Attach the Scaffold default middleware to your Koa application
  app.use(scaffold.middleware.allModels.all);

  // Set up any other Koa routes, middleware, etc, that you want.
  app.use(async (ctx) => {
    ctx.body = { response: "Default Router Hit" };
  });

  return [app, scaffold];
}
