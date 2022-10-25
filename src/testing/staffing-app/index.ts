import {
    createScaffoldApplication,
    startScaffoldApplication,
} from "../../exports";

import { Assignment } from "./models/Assignment";
import { Employee } from "./models/Employee";
import { Project } from "./models/Project";
import { Role } from "./models/Role";
import { Skill } from "./models/Skill";

async function init() {
    console.log("Creating Scaffing Application");

    const config = {
        models: [Assignment, Employee, Project, Role, Skill],
        relationships: {
            
        }
    }

    const app = await createScaffoldApplication([Assignment, Employee, Project, Role, Skill]);

    console.log("Starting Staffing Application");
    await startScaffoldApplication(app, 3000);

    console.log("Started on port 3000");
}

init();
