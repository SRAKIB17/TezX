import { Router } from "./core/router.js";
import { TezX } from "./core/server.js";
export type { Context as BaseContext } from "./core/context.js";
export type { NetAddr as AddressType, Callback, Ctx as Context, CookieOptions, ErrorHandler, FormDataOptions, HandlerType, HttpBaseResponse, HTTPMethod, Middleware, NextCallback, RequestHeaders, ResponseHeaders, ResponseInit, RouteMatchResult, RouteRegistry, Runtime, StaticFileArray, StaticServeOption, WebSocketCallback, WebSocketEvent, WebSocketOptions } from "./types/index.js";
export type { TezXConfig } from "./core/server.js";
export type { TezXRequest } from "./core/request.js";
export type { RouterConfig } from "./core/router.js";
export { Router, TezX };
export declare let version: string;
declare const _default: {
    Router: typeof Router;
    TezX: typeof TezX;
    version: string;
};
export default _default;
