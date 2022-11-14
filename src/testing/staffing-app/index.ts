import { Scaffold, scaffoldAPIResponseMiddleware } from "../../exports";
import path from "path"
import Koa from "koa";
import signale from "signale";

import { Assignment } from "./models/Assignment";
import { Employee } from "./models/Employee";
import { Project } from "./models/Project";
import { Role } from "./models/Role";
import { Skill } from "./models/Skill";

// Create a basic Koa application
const app = new Koa();

// Create a Scaffold instance containing your Models
const scaffold = new Scaffold([Assignment, Employee, Project, Role, Skill], {
  prefix: "/api",
  sync: true,
  database: {
    dialect: 'sqlite',
    storage: path.join(__dirname, "..", "example.sqlite")
  }
});

// Set up your Koa app as normal, for example, a logging middleware
app.use(async (ctx, next) => {
  signale.info("Incoming Request: ", ctx.method, ctx.path);
  await next();
});

// Optionally, customize your Scaffold behavior for specific Models
// Here we override the findAll for the Skill model to perform a findAndCountAll
// along with a customized response containing additional data

scaffold.custom.findAll(Skill, [
  async (ctx, next) => {
    const SkillQuery = scaffold.models(Skill);
    SkillQuery.update()
    const result = await SkillQuery.findAndCountAll({
      where: {
        badValue: true
      }
    });

    ctx.state.body = {
      customResponseFormat: true,
      result: result
    }
    ctx.state.status = 200;
    await next()
  },
  // We can import and use the provided Scaffold Middlewares
  scaffoldAPIResponseMiddleware()
]);

// Attach the Scaffold default middleware to your Koa application
app.use(scaffold.defaults());

// Set up any other Koa routes, middleware, etc, that you want.
app.use(async (ctx) => {
  ctx.body = { response: "Hello World" };
});

// Start the Koa app listening
app.listen(3000, () => {
  console.log("Started on port 3000");
});