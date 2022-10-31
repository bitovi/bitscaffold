import Router from "@koa/router";
import signale from "signale";
import {
  scaffoldFindAllDefaultMiddleware,
  scaffoldFindOneDefaultMiddleware,
  scaffoldCreateDefaultMiddleware,
  scaffoldDeleteDefaultMiddleware,
  scaffoldUpdateDefaultMiddleware,
} from "../middleware";

export function prepareDefaultRoutes(router: Router): Router {
  signale.pending("prepareDefaultRoutes");
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
  signale.success("prepareDefaultRoutes");
}
