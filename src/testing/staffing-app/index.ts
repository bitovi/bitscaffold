import {
    createScaffoldApplication,
    Scaffold
} from "../../exports";
import Koa from "koa";

import { Assignment } from "./models/Assignment";
import { Employee } from "./models/Employee";
import { Project } from "./models/Project";
import { Role } from "./models/Role";
import { Skill } from "./models/Skill";

async function initDefaults() {
    console.log("Creating Scaffold Staffing Application, defaults");
    const scaffold = await Scaffold([Assignment, Employee, Project, Role, Skill], { port: 3000 })

    // This would build out all the rest of the defaults
    // This is the idea of a 'do everything for me' function
    await scaffold.makeScaffoldDefaults();

    // Start the service listening on the configured port above
    await scaffold.listen();
}



async function initOverrides() {
    console.log("Creating Scaffold Staffing Application, overrides");
    const scaffold = await Scaffold([Assignment, Employee, Project, Role, Skill], { port: 3001 })

    // This would be a way to inject your own logic into the routes
    // Option one, do it at the CRUD level. Passing a single override?
    // 
    // How do we deal with the same sorts of middleware 'issues' where it depends
    // totally on context
    await scaffold.makeScaffoldCRUD(Skill, {
        findAll: async (ctx, next) => {
            // Have not yet figured out exactly how this will work...
            // But the idea would be that you pass your own handler for this
            // Maybe more granular, or split the Model lookup and the route handling
            ctx.body = "findAllOverride";
            await next()
        }

        // The other routes would be the default
    })

    // Could also structure it this way, overwrite just the findAll call here
    // The rest of the routes for Skill would be created by makeScaffoldDefaults()
    await scaffold.makeScaffoldFindAll(Skill, async (ctx, next) => {
        ctx.body = "findAllOverride";
        await next()
    });


    // This would build out all the rest of the defaults
    await scaffold.makeScaffoldDefaults();


    // Start the service listening on the configured port above
    await scaffold.listen();
}

initDefaults();
initOverrides();
