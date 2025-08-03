import { GlobalConfig } from "../core/config.js";
const xssProtection = (options = {}) => {
    const { enabled = true, mode = "block", fallbackCSP = "default-src 'self'; script-src 'self';", } = options;
    return async function xssProtection(ctx, next) {
        const isEnabled = typeof enabled === "function" ? enabled(ctx) : enabled;
        if (!isEnabled) {
            GlobalConfig.debugging.warn("🟠 XSS protection is disabled.");
            return await next();
        }
        const xssHeaderValue = mode === "block" ? "1; mode=block" : "1";
        ctx.setHeader("X-XSS-Protection", xssHeaderValue);
        GlobalConfig.debugging.warn(`🟢 X-XSS-Protection set to: ${xssHeaderValue}`);
        if (fallbackCSP) {
            const existingCSP = ctx.req.header("content-security-policy");
            if (!existingCSP) {
                ctx.setHeader("Content-Security-Policy", fallbackCSP);
                GlobalConfig.debugging.warn(`🟣 Fallback CSP set to: ${fallbackCSP}`);
            }
        }
        return await next();
    };
};
export { xssProtection, xssProtection as default };
