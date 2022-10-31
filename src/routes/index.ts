import Router from "@koa/router";
import signale from "signale";
import {
  scaffoldFindAllDefaultMiddleware,
  scaffoldFindOneDefaultMiddleware,
  scaffoldCreateDefaultMiddleware,
  scaffoldDeleteDefaultMiddleware,
  scaffoldUpdateDefaultMiddleware,
} from "../middleware";

export function prepareDefaultRoutes(): Router {
  signale.pending("prepareDefaultRoutes");
  const router: Router = new Router();
  /**
   * A wildcard route for any passed in model, the middleware function here
   * could provide sane defaults for authorization, validation, findOne behavior
   */
  router.get("/api/:model/:id", scaffoldFindOneDefaultMiddleware());

  /**
   * A wildcard route for any passed in model, the middleware function here
   * could provide sane defaults for authorization, validation, update behavior
   */
  router.put("/api/:model/:id", scaffoldUpdateDefaultMiddleware());

  /**
   * A wildcard route for any passed in model, the middleware function here
   * could provide sane defaults for authorization, validation, delete behavior
   */
  router.del("/api/:model/:id", scaffoldDeleteDefaultMiddleware());

  /**
   * A wildcard route for any passed in model, the middleware function here
   * could provide sane defaults for authorization, validation, findAll behavior
   */
  router.get("/api/:model", scaffoldFindAllDefaultMiddleware());

  /**
   * A wildcard route for any passed in model, the middleware function here
   * could provide sane defaults for authorization, validation, create behavior
   */
  router.post("/api/:model", scaffoldCreateDefaultMiddleware());
  signale.success("prepareDefaultRoutes");
  return router;
}
