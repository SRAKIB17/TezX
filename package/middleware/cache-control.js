import { GlobalConfig } from "../core/config.js";
const cacheControl = (options) => {
    const { defaultSettings, useWeakETag = false, rules = [], onError = (error, ctx) => {
        ctx.setStatus = 500;
        ctx.body = { error: "Failed to set cache headers." };
    }, logEvent = (event, ctx, error) => {
        if (event === "error") {
            GlobalConfig.debugging.error(`[CACHE] ${event.toUpperCase()}: ${error?.message}`);
        }
        else {
            GlobalConfig.debugging.success(`[CACHE] ${event.toUpperCase()} for ${ctx.method} ${ctx.pathname}`);
        }
    }, } = options;
    return async function cacheControl(ctx, next) {
        if (!["GET", "HEAD"].includes(ctx.method)) {
            return await next();
        }
        try {
            await next();
            const matchedRule = rules.find((rule) => rule.condition(ctx)) || null;
            const { maxAge, scope, enableETag, vary } = matchedRule || defaultSettings;
            const cacheControlValue = `${scope}, max-age=${maxAge}`;
            ctx.setHeader("Cache-Control", cacheControlValue);
            const expiresDate = new Date(Date.now() + maxAge * 1000).toUTCString();
            ctx.setHeader("Expires", expiresDate);
            if (vary?.length) {
                ctx.setHeader("Vary", vary.join(", "));
            }
            if (enableETag) {
                const responseBody = typeof ctx.resBody === "string"
                    ? ctx.resBody
                    : JSON.stringify(ctx.resBody ?? "");
                const etag = await generateETag(responseBody, useWeakETag);
                const ifNoneMatch = ctx.req.header("if-none-match");
                if (ifNoneMatch === etag) {
                    ctx.setStatus = 304;
                    ctx.body = null;
                    logEvent("cached", ctx);
                    return;
                }
                ctx.setHeader("ETag", etag);
            }
            logEvent("cached", ctx);
        }
        catch (error) {
            logEvent("error", ctx, error);
            return onError?.(error, ctx);
        }
    };
};
const generateETag = async (content, weak = false) => {
    const crypto = await import("node:crypto");
    const hash = crypto.createHash("md5").update(content).digest("hex");
    return weak ? `W/"${hash}"` : `"${hash}"`;
};
export { cacheControl, cacheControl as default };
