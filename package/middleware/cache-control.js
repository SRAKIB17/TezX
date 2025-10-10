import { TezXErrorParse } from "../core/error.js";
export const cacheControl = (opts) => {
    const { defaultSettings, rules = [], onError = (err, ctx) => {
        ctx.setStatus = 500;
        ctx.body = { error: err.message ?? "Cache middleware failed" };
    }, } = opts;
    const len = rules.length | 0;
    return async function cacheControlMiddleware(ctx, next) {
        const method = ctx.method;
        if (method !== "GET" && method !== "HEAD") {
            return await next();
        }
        try {
            await next();
            let matched;
            for (let i = 0; i < len; i++) {
                const rule = rules[i];
                if (rule.condition(ctx)) {
                    matched = rule;
                    break;
                }
            }
            const settings = matched ?? defaultSettings;
            const maxAge = settings.maxAge;
            const scope = settings.scope;
            const vary = settings.vary;
            const cacheValue = `${scope}, max-age=${maxAge}`;
            const expiresValue = new Date(Date.now() + maxAge * 1000).toUTCString();
            const headers = ctx.headers;
            headers.set("Cache-Control", cacheValue);
            headers.set("Expires", expiresValue);
            if (vary && vary.length > 0)
                headers.set("Vary", vary.join(", "));
        }
        catch (err) {
            return onError(TezXErrorParse(err), ctx);
        }
    };
};
export default cacheControl;
