import Koa, { Middleware } from "koa";
import KoaBodyParser from "koa-body";
import Router from "@koa/router";
import signale, { Signale } from "signale";
import KoaCors from "@koa/cors";
import { v4 } from "uuid";
import os from "os";
import { prepareDefaultRoutes } from "./routes";
import { ScaffoldApplication, ScaffoldModelBase } from "./types";
import { prepareModels, prepareSequelize } from "./sequelize";

/**
 * Entrypoint
 */
export async function createScaffoldApplication(
  models: ScaffoldModelBase[],
  routes?: Router
): Promise<ScaffoldApplication> {
  signale.info("Creating Scaffold Application");
  const app = new Koa();
  await prepareKoaApplication(app);
  await prepareSequelize(app);
  await prepareModels(app, models);

  if (routes) {
    signale.info("Attaching externally defined Routes");
    app.use(routes.routes());
    app.use(routes.allowedMethods());
  }

  signale.info("Attaching default Routes");
  const router = await prepareDefaultRoutes();
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

export async function startScaffoldApplication(
  app: ScaffoldApplication,
  port?: number
): Promise<void> {
  signale.info("Starting Scaffold Application listening");
  await app.listen(port || 3000);
}

export function attachScaffoldDefaultMiddleware(
  models: ScaffoldModelBase[],
  app: Koa
): Middleware {
  const setup = async () => {
    signale.info("Running Middleware Setup Function");
    await prepareKoaApplication(app);
    await prepareSequelize(app);
    await prepareModels(app, models);
  };
  setup();
  return async function attachScaffoldDefault(ctx, next) {
    signale.info("attachScaffoldDefaultMiddleware no-op");
    await next();
  };
}

async function prepareKoaApplication(app: Koa): Promise<void> {
  if (!app.context.bitscaffold) {
    signale.info("Creating Koa Application Defaults");
    // Check if this koa app has already been processed
    app.context.bitscaffold = true;

    // Catch top level errors and format them correctly
    app.use(ErrorHandler())

    // Hook up cors
    app.use(KoaCors({ origin: "*" }));

    // Enable the body parser for relevant methods
    app.use(
      KoaBodyParser({
        parsedMethods: ["POST", "PUT", "PATCH", "DELETE"],
        multipart: true,
        includeUnparsed: true,
        formidable: { multiples: true, uploadDir: os.tmpdir() },
      })
    );

    // Attach some debugging uuid information to
    // state, logging, and response headers
    app.use(async (ctx: Koa.Context, next: Koa.Next) => {
      ctx.state.uuid = v4();
      ctx.state.logger = new Signale({ scope: ctx.state.uuid });

      ctx.set("x-koa-uuid", ctx.state.uuid);
      await next();
    });
  }
}


function ErrorHandler() {
  return async function ErrorHandlerMiddleware(ctx: Koa.Context, next: Koa.Next) {
    return next().catch((err) => {
      ctx.type = 'json';

      ctx.status = err.statusCode || 500
      ctx.body = {
        errors: [err.message],
        data: null,
        meta: err,
      };

      if (ctx.state.logger) {
        ctx.state.logger.error(err.message, err)
      }

      ctx.app.emit('error', err, ctx);
    });
  }
}