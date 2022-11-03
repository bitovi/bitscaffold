/* eslint-disable no-unused-vars */
import { Context, DefaultContext, DefaultState, Middleware, ParameterizedContext } from 'koa';
import { IncomingMessage, ServerResponse } from 'http';
import { Request, RequestHandler, Response } from 'express';


type ConnectMiddleware = (
    req: IncomingMessage,
    res: ServerResponse,
    callback: (...args: unknown[]) => void
) => void;

const noop = () => { };

/**
 * If the middleware function does not declare receiving the `next` callback
 * assume that it's synchronous and invoke `next` ourselves.
 */
function noCallbackHandler(
    req: IncomingMessage,
    res: ServerResponse,
    koaMiddleware: Middleware,
    next: (err?: unknown) => void
): void {
    const ctx: ParameterizedContext<DefaultState, DefaultContext, any> = { req, res };
    koaMiddleware(ctx, noop);
    return next();
}

/**
 * The middleware function does include the `next` callback so only resolve
 * the Promise when it's called. If it's never called, the middleware stack
 * completion will stall.
 */
function withCallbackHandler(
    req: IncomingMessage,
    res: ServerResponse,
    koaMiddleware: Middleware,
    next: (err?: unknown) => void
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const ctx: ParameterizedContext<DefaultState, DefaultContext, any> = { req, res };
        koaMiddleware(ctx, (err?: unknown) => {
            if (err) reject(err);
            else resolve(next());
        });
    });
}

function expressConnect(koaMiddleware: Middleware): RequestHandler {
    const handler =
        koaMiddleware.length < 3 ? noCallbackHandler : withCallbackHandler;
    return function connect(req: Request, res: Response, next: () => void) {
        return handler(req, res, koaMiddleware, next);
    };
}

export = expressConnect;