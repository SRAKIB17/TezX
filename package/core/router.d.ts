import { Context, ResponseHeaders } from "./context.js";
import MiddlewareConfigure, { DuplicateMiddlewares, UniqueMiddlewares } from "./MiddlewareConfigure.js";
import { HTTPMethod } from "./request.js";
export type ctx<T extends Record<string, any> = {}> = Context<T> & T;
export type NextCallback = () => Promise<any>;
export type CallbackReturn = Promise<Response> | Response;
export type Callback<T extends Record<string, any> = {}> = (ctx: ctx<T>) => CallbackReturn;
export type Middleware<T extends Record<string, any> = {}> = (ctx: ctx<T>, next: NextCallback) => Promise<Response> | Response | NextCallback;
export type RouterConfig = {
    /**
     * `env` allows you to define environment variables for the router.
     * It is a record of key-value pairs where the key is the variable name
     * and the value can be either a string or a number.
     */
    env?: Record<string, string | number>;
    /**
     * `basePath` sets the base path for the router. This is useful for grouping
     * routes under a specific path prefix.
     */
    basePath?: string;
};
declare class TrieRouter {
    children: Map<string, TrieRouter>;
    handlers: Map<HTTPMethod, {
        callback: Callback<any>;
        middlewares: UniqueMiddlewares | DuplicateMiddlewares;
    }>;
    pathname: string;
    paramName: any;
    isParam: boolean;
    constructor(pathname?: string);
}
export type StaticServeOption = {
    cacheControl?: string;
    headers?: ResponseHeaders;
};
export declare class Router<T extends Record<string, any> = {}> extends MiddlewareConfigure<T> {
    #private;
    protected routers: Map<string, Map<HTTPMethod, {
        callback: Callback<T>;
        middlewares: UniqueMiddlewares | DuplicateMiddlewares;
    }>>;
    protected env: Record<string, string | number>;
    protected triRouter: TrieRouter;
    constructor({ basePath, env }?: RouterConfig);
    /**
     * Serves static files from a specified directory.
     *
     * This method provides two overloads:
     * 1. `static(route: string, folder: string, option?: StaticServeOption): this;`
     *    - Serves static files from `folder` at the specified `route`.
     * 2. `static(folder: string, option?: StaticServeOption): this;`
     *    - Serves static files from `folder` at the root (`/`).
     *
     * @param {string} route - The base route to serve static files from (optional in overload).
     * @param {string} folder - The folder containing the static files.
     * @param {StaticServeOption} [option] - Optional settings for static file serving.
     * @returns {this} Returns the current instance to allow method chaining.
     */
    static(route: string, folder: string, option?: StaticServeOption): this;
    static(folder: string, Option?: StaticServeOption): this;
    /**
     * Registers a GET route with optional middleware(s)
     * @param path - URL path pattern (supports route parameters)
     * @param args - Handler callback or middleware(s) + handler
     * @returns Current instance for chaining
     *
     * @example
     * // Simple GET route
     * app.get('/users', (ctx) => { ... });
     *
     * // With middleware
     * app.get('/secure', authMiddleware, (ctx) => { ... });
     *
     * // With multiple middlewares
     * app.get('/admin', [authMiddleware, adminMiddleware], (ctx) => { ... });
     */
    get(path: string, callback: Callback<T>): this;
    get(path: string, middleware: Middleware<T>): this;
    get(path: string, middleware: Middleware<T>, callback: Callback<T>): this;
    get(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    /**
     * Registers a POST route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    post(path: string, callback: Callback<T>): this;
    post(path: string, middleware: Middleware<T>): this;
    post(path: string, middleware: Middleware<T>, callback: Callback<T>): this;
    post(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    /**
     * Registers a PUT route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    put(path: string, callback: Callback<T>): this;
    put(path: string, middleware: Middleware<T>): this;
    put(path: string, middleware: Middleware<T>, callback: Callback<T>): this;
    put(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    /**
     * Registers a PATCH route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    patch(path: string, callback: Callback<T>): this;
    patch(path: string, middleware: Middleware<T>): this;
    patch(path: string, middleware: Middleware<T>, callback: Callback<T>): this;
    patch(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    /**
     * Registers a DELETE route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    delete(path: string, callback: Callback<T>): this;
    delete(path: string, middleware: Middleware<T>): this;
    delete(path: string, middleware: Middleware<T>, callback: Callback<T>): this;
    delete(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    /**
     * Registers an OPTIONS route (primarily for CORS preflight requests)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    options(path: string, callback: Callback<T>): this;
    options(path: string, middleware: Middleware<T>): this;
    options(path: string, middleware: Middleware<T>, callback: Callback<T>): this;
    options(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    /**
     * Registers a HEAD route (returns headers only)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    head(path: string, callback: Callback<T>): this;
    head(path: string, middleware: Middleware<T>): this;
    head(path: string, middleware: Middleware<T>, callback: Callback<T>): this;
    head(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    /**
     * Registers a route that responds to all HTTP methods
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    all(path: string, callback: Callback<T>): this;
    all(path: string, middleware: Middleware<T>): this;
    all(path: string, middleware: Middleware<T>, callback: Callback<T>): this;
    all(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    /**
     * Generic method registration for custom HTTP methods
     * @param method - HTTP method name (e.g., 'PURGE')
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     *
     * @example
     * // Register custom method
     * server.addRoute('PURGE', '/cache', purgeHandler);
     */
    addRoute(method: HTTPMethod, path: string, callback: Callback<T>): this;
    addRoute(method: HTTPMethod, path: string, middleware: Middleware<T>): this;
    addRoute(method: HTTPMethod, path: string, middleware: Middleware<T>, callback: Callback<T>): this;
    addRoute(method: HTTPMethod, path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    /**
     * Mount a sub-router at specific path prefix
     * @param path - Base path for the sub-router
     * @param router - Router instance to mount
     * @returns Current instance for chaining
     *
     * @example
     * const apiRouter = new Router();
     * apiRouter.get('/users', () => { ... });
     * server.addRouter('/api', apiRouter);
     */
    addRouter(path: string, router: Router<T | any>): void;
    /**
     * Create route group with shared path prefix
     * @param prefix - Path prefix for the group
     * @param callback - Function that receives group-specific router
     * @returns Current router instance for chaining
     *
     * @example
     * app.group('/v1', (group) => {
     *   group.get('/users', v1UserHandler);
     * });
     */
    group(prefix: string, callback: (group: Router<T>) => void): this;
    /**
     * Register middleware with flexible signature
     * @overload
     * @param path - Optional path to scope middleware
     * @param middlewares - Middleware(s) to register
     * @param [callback] - Optional sub-router or handler
     */
    use(path: string, middlewares: Middleware<T>[], callback: Callback<T> | Router<T | any>): this;
    use(path: string, middleware: Middleware<T>, callback: Callback<T> | Router<T | any>): this;
    use(path: string, middlewares: Middleware<T>[]): this;
    use(path: string, middleware: Middleware<T>): this;
    use(path: string, callback: Callback<T> | Router<T | any>): this;
    use(middlewares: Middleware<T>[], callback: Callback<T> | Router<T | any>): this;
    use(middleware: Middleware<T>, callback: Callback<T> | Router<T | any>): this;
    use(middlewares: Middleware<T>[]): this;
    use(middleware: Middleware<T>): this;
    use(callback: Callback<T> | Router<T | any>): this;
}
export {};
