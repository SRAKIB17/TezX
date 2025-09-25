import { handleErrorResponse, notFoundResponse } from "../utils/response.js";
import { getPathname } from "../utils/url.js";
import { GlobalConfig } from "./config.js";
import { Context } from "./context.js";
import { TezXError } from "./error.js";
import { Router } from "./router.js";
export class TezX extends Router {
    #pathResolver;
    #notFound = notFoundResponse;
    #errorHandler = handleErrorResponse;
    constructor({ basePath = "/", env = {}, debugMode = false, onPathResolve, routeRegistry, } = {}) {
        if (debugMode) {
            GlobalConfig.debugMode = debugMode;
        }
        super({ basePath, env, routeRegistry });
        this.#pathResolver = onPathResolve;
        this.serve = this.serve.bind(this);
    }
    notFound(callback) {
        this.#notFound = callback;
        return this;
    }
    onError(callback) {
        this.#errorHandler = callback;
        return this;
    }
    async #chain(ctx, mLen, middlewares, hLen, handlers) {
        let index = -1;
        let res;
        async function dispatch(i) {
            if (i <= index)
                throw new Error("next() called multiple times");
            index = i;
            if (i < mLen) {
                const fn = middlewares[i];
                if (typeof fn !== "function")
                    throw new TypeError(`Middleware[${i}] must be a function`);
                res = (await fn(ctx, () => dispatch(i + 1)));
                if (res !== undefined) {
                    ctx.res = res;
                }
                return ctx.res;
            }
            const hi = i - mLen;
            if (hi < hLen) {
                const fn = handlers[hi];
                if (typeof fn !== "function")
                    throw new TypeError(`Handler[${hi}] must be a function`);
                res = (await fn(ctx, () => dispatch(i + 1)));
                if (res !== undefined) {
                    ctx.res = res;
                }
                return ctx.res;
            }
        }
        await dispatch(0);
        return (ctx.res ??
            (ctx.body !== undefined ? ctx.send(ctx.body) : this.#notFound(ctx)));
    }
    async #handleRequest(req, method, args) {
        if (!(req instanceof Request))
            throw new Error("Invalid request object provided to tezX server.");
        const rawPath = getPathname(req.url);
        const pathname = this.#pathResolver
            ? await this.#pathResolver(rawPath)
            : rawPath;
        const ctx = new Context(req, pathname, method, this.env, args);
        try {
            const staticHandler = this.staticFile?.[`${method} ${pathname}`];
            if (staticHandler) {
                return staticHandler(ctx);
            }
            const route = this.router.search(method, pathname);
            const mLen = route?.middlewares?.length;
            const hLen = route?.handlers?.length;
            if (!route || (hLen === 0 && mLen === 0)) {
                return this.#notFound(ctx);
            }
            ctx.params = route.params;
            if (hLen === 1 && mLen === 0) {
                return ((await route.handlers[0](ctx)) ??
                    (ctx.body !== undefined ? ctx.send(ctx.body) : this.#notFound(ctx)));
            }
            return await this.#chain(ctx, mLen, route.middlewares, hLen, route.handlers);
        }
        catch (err) {
            if (!(err instanceof TezXError)) {
                return this.#errorHandler?.(TezXError.internal(err?.message, err?.stack), ctx);
            }
            return this.#errorHandler?.(err, ctx);
        }
    }
    async serve(req, ...args) {
        const method = (req.method ?? "GET").toUpperCase();
        if (method === "HEAD") {
            const getRequest = new Request(req.url, { ...req, method: "GET" });
            const headResponse = await this.#handleRequest(getRequest, method, args);
            return new Response(null, {
                status: headResponse.status,
                statusText: headResponse.statusText,
                headers: headResponse.headers,
            });
        }
        return this.#handleRequest(req, method, args);
    }
}
