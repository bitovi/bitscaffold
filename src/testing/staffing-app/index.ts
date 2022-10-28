import {
    Scaffold,
} from "../../exports";

import { Assignment } from "./models/Assignment";
import { Employee } from "./models/Employee";
import { Project } from "./models/Project";
import { Role } from "./models/Role";
import { Skill } from "./models/Skill";

async function initDefaults() {
    console.log("Creating Scaffold Staffing Application, defaults");
    const scaffold = new Scaffold([Assignment, Employee, Project, Role, Skill], { port: 3000 })

    // This would build out all the rest of the defaults
    // This is the idea of a 'do everything for me' function
    await scaffold.makeScaffoldDefaults();

    // Start the service listening on the configured port above
    await scaffold.finalize();
    await scaffold.listen();
}



async function initOverrides() {
    console.log("Creating Scaffold Staffing Application, overrides");
    const scaffold = new Scaffold([Assignment, Employee, Project, Role, Skill], { port: 3000 })

    // Create a custom Create route for Skill model
    await scaffold.routeCreate(Skill, async (ctx, next) => {
        ctx.body = "Hello World";
        ctx.status = 201;
        await next();
    });

    // Create a custom Create handler for Skill model so we can provide some
    // additional information, such as a createdAt date
    await scaffold.routeCreate(Skill, async (ctx, next) => {
        const model = scaffold.resolveSequelizeModel(Skill);
        const result = await model.create({ ...ctx.body, createdAt: new Date() })

        ctx.body = result;
        ctx.status = 201;
        await next();
    });

    // 
    await scaffold.routeUpdate(Skill, async (ctx, next) => {
        const model = scaffold.resolveSequelizeModel(Skill);
        const result = await model.update({ ...ctx.body, modifiedAt: new Date() }, {
            where: {
                id: ctx.params.id
            }
        })

        ctx.body = result;
        ctx.status = 200;
        await next();
    });


    await scaffold.get('/api/totally-custom-route', async (ctx, next) => {
        ctx.body = "Custom Route"
        ctx.status = 200;
        await next();
    });

    // This would build out all the rest of the defaults
    await scaffold.makeScaffoldDefaults();

    // Start the service listening on the configured port above
    await scaffold.finalize();
    await scaffold.listen();
}

//initDefaults();
initOverrides();
