import Koa from "koa";

export function ErrorHandler() {
  return async function ErrorHandlerMiddleware(
    ctx: Koa.Context,
    next: Koa.Next
  ) {
    return next().catch((err) => {
      ctx.type = "json";

      ctx.status = err.statusCode || 500;
      ctx.body = {
        errors: [err.message],
        data: null,
        meta: err,
      };

      if (ctx.state.logger) {
        ctx.state.logger.error(err.message, err);
      }

      ctx.app.emit("error", err, ctx);
    });
  };
}
