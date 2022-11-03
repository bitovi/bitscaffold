import { Scaffold, scaffoldAPIResponseMiddleware } from "../../exports";
import Express from "express";
import signale from "signale";

import { Assignment } from "./models/Assignment";
import { Employee } from "./models/Employee";
import { Project } from "./models/Project";
import { Role } from "./models/Role";
import { Skill } from "./models/Skill";

// Create a basic express application
const app = Express();

// Create a Scaffold instance containing your Models
const scaffold = new Scaffold([Assignment, Employee, Project, Role, Skill], {
  prefix: "/api",
  sync: true
});

// Set up your Express app as normal, for example, a logging middleware
app.use((req, res, next) => {
  signale.info("Incoming Request: ", req.method, req.path);
  next();
});

// Optionally, customize your Scaffold behavior for specific Models
// Here we override the findAll for the Skill model to perform a findAndCountAll
// along with a customized response containing additional data
scaffold.custom.findAll(Skill, [
  async (ctx, next) => {
    const SkillQuery = scaffold.models(Skill);
    const result = await SkillQuery.findAndCountAll();

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

// Attach the Scaffold default middleware to your Express application
app.use(async (req, res) => {
  const SkillQuery = scaffold.models(Skill);
  const result = await SkillQuery.findAndCountAll();

  res.send(JSON.stringify({
    customResponseFormat: true,
    express: true,
    result: result
  }))
});

// Set up any other Express routes, middleware, etc, that you want.
app.use((req, res) => {
  res.send(JSON.stringify({ response: "Hello World" }))
});

// Start the Express app listening
app.listen(3000, () => {
  console.log("Started on port 3000");
});