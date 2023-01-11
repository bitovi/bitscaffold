import { DataTypes, Scaffold } from "../../exports";
import Koa from "koa";
import signale from "signale";

import { App, User, Host } from "./models";

export async function createDashboardAppInstance() {
  // Create a basic Koa application
  const app = new Koa();

  // Create a Scaffold instance containing your Models
  const scaffold = new Scaffold([User, App, Host], {
    prefix: "/api",
    database: {
      dialect: "sqlite",
    },
  });

  scaffold.orm.define('user', {
    firstName: DataTypes.TEXT,
    lastName: DataTypes.TEXT,
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.firstName} ${this.lastName}`;
      },
      set(value) {
        throw new Error('Do not try to set the `fullName` value!');
      }
    }
  });

  // Set up your Koa app as normal, for example, a logging middleware
  app.use(async (ctx, next) => {
    signale.info("Incoming Request: ", ctx.method, ctx.path);
    await next();
  });

  // Attach the Scaffold default middleware to your Koa application
  app.use(scaffold.middleware.allModels.findAll);
  app.use(scaffold.middleware.allModels.findOne);

  app.listen(3000, () => {
    console.log("Scaffold Started");
  });
}

createDashboardAppInstance();
