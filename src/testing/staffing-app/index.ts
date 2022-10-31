import { Scaffold } from "../../exports";
import Koa from "koa";

import { Assignment } from "./models/Assignment";
import { Employee } from "./models/Employee";
import { Project } from "./models/Project";
import { Role } from "./models/Role";
import { Skill } from "./models/Skill";

console.log("Creating Scaffold Staffing Application, defaults");
const app = new Koa();
const scaffold = new Scaffold([Assignment, Employee, Project, Role, Skill], {});

app.use(scaffold.defaults());
app.listen(3000);
