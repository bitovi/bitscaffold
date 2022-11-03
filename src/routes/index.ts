import Router from "@koa/router";
import { ScaffoldModel, ScaffoldModelContext } from "../types";
import compose from "koa-compose";
import { Middleware, DefaultState } from "koa";
import signale from "signale";
import { stateDefaultsMiddleware, paramsDefaultsMiddleware } from "../middleware";

import {
  scaffoldFindAllDefaultMiddleware,
  scaffoldFindOneDefaultMiddleware,
  scaffoldCreateDefaultMiddleware,
  scaffoldDeleteDefaultMiddleware,
  scaffoldUpdateDefaultMiddleware,
} from "../middleware";

export function prepareDefaultRoutes(router: Router): Router {
  /**
   * A wildcard route for any passed in model, the middleware function here
   * could provide sane defaults for authorization, validation, findOne behavior
   */
  router.get("/:model/:id", scaffoldFindOneDefaultMiddleware());

  /**
   * A wildcard route for any passed in model, the middleware function here
   * could provide sane defaults for authorization, validation, update behavior
   */
  router.put("/:model/:id", scaffoldUpdateDefaultMiddleware());

  /**
   * A wildcard route for any passed in model, the middleware function here
   * could provide sane defaults for authorization, validation, delete behavior
   */
  router.del("/:model/:id", scaffoldDeleteDefaultMiddleware());

  /**
   * A wildcard route for any passed in model, the middleware function here
   * could provide sane defaults for authorization, validation, findAll behavior
   */
  router.get("/:model", scaffoldFindAllDefaultMiddleware());

  /**
   * A wildcard route for any passed in model, the middleware function here
   * could provide sane defaults for authorization, validation, create behavior
   */
  router.post("/:model", scaffoldCreateDefaultMiddleware());
}

function composeMiddleware(model, middlewares) {
  return compose([
    paramsDefaultsMiddleware({ model: model.name }),
    stateDefaultsMiddleware({ params: { model: model.name } }),
    ...middlewares,
  ]);
}

/**
 * Creates an override for the URL `GET /:model/:id`, will replace the default handler
 * with whatever Middleware functions are supplied in `middlewares`
 *
 * The Model name will be used to generate the internal route, replacing :model.
 * The Model name will be attached to `ctx.params.model` in Koa Context
 *
 * @param Model
 * @param middlewares
 */
export function attachGetOne(model: ScaffoldModel, middlewares: Middleware[]) {
  signale.pending("Custom findOne: ", model.name);
  this.router.get(
    "/" + model.name + "/:id",
    composeMiddleware(model, middlewares)
  );
  signale.success("Custom findOne: ", model.name);
}

/**
 * Creates an override for the URL `GET /:model`, will replace the default handler
 * with whatever Middleware functions are supplied in `middlewares`
 *
 * The Model name will be used to generate the internal route, replacing :model.
 * The Model name will be attached to `ctx.params.model` in Koa Context
 *
 * @param Model
 * @param middlewares
 */
export function attachGetAll<T extends ScaffoldModel>(
  Model: T,
  middlewares: Middleware[]
): void {
  signale.pending("Custom findAll: ", Model.name);
  this.router.get("/" + Model.name + "", composeMiddleware(Model, middlewares));
  signale.success("Custom findAll: ", Model.name);
}

/**
 * Creates an override for the URL `POST /:model`, will replace the default handler
 * with whatever Middleware functions are supplied in `middlewares`
 *
 * The Model name will be used to generate the internal route, replacing :model.
 * The Model name will be attached to `ctx.params.model` in Koa Context
 *
 * @param Model
 * @param middlewares
 */
export function attachPost(
  Model: ScaffoldModel,
  middlewares: Middleware[]
): void {
  signale.pending("Custom post: ", Model.name);
  this.router.post(
    "/" + Model.name + "",
    composeMiddleware(Model, middlewares)
  );
  signale.success("Custom post: ", Model.name);
}

/**
 * Creates an override for the URL `PUT /:model/:id`, will replace the default handler
 * with whatever Middleware functions are supplied in `middlewares`
 *
 * The Model name will be used to generate the internal route, replacing :model.
 * The Model name will be attached to `ctx.params.model` in Koa Context
 *
 * @param Model
 * @param middlewares
 */
export function attachPut(
  Model: ScaffoldModel,
  middlewares: Middleware[]
): void {
  signale.pending("Custom put: ", Model.name);
  this.router.put(
    "/" + Model.name + "/:id",
    composeMiddleware(Model, middlewares)
  );
  signale.success("Custom put: ", Model.name);
}

/**
 * Creates an override for the URL `DELETE /:model/:id`, will replace the default handler
 * with whatever Middleware functions are supplied in `middlewares`
 *
 * The Model name will be used to generate the internal route, replacing :model.
 * The Model name will be attached to `ctx.params.model` in Koa Context
 *
 * @param Model
 * @param middlewares
 */
export function attachDelete(
  Model: ScaffoldModel,
  middlewares: Middleware[]
): void {
  signale.pending("Custom delete: ", Model.name);
  this.router.delete(
    "/" + Model.name + "/:id",
    composeMiddleware(Model, middlewares)
  );
  signale.success("Custom delete: ", Model.name);
}

/**
 * Creates a completely custom route with custom middleware
 *
 * @param type The type of HTTP request to handle
 * @param path The URL to bind for the route handler
 * @param middleware A Koa Middleware route handler
 */
export function attachCustom(
  type: "GET" | "PUT" | "POST" | "DELETE" | "HEAD",
  path: string,
  middleware: Middleware<DefaultState, ScaffoldModelContext>
): void {
  signale.pending("Custom route: ", type, path);
  this.router[type.toLowerCase()](path, middleware);
  signale.success("Custom route: ", type, path);
}
