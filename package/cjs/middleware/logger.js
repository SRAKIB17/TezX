"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = logger;
const colors_js_1 = require("../utils/colors.js");
function logger() {
    return async function logger(ctx, next) {
        try {
            console.log(`${colors_js_1.COLORS.bold}<-- ${colors_js_1.COLORS.reset}${colors_js_1.COLORS.bgMagenta} ${ctx.method} ${colors_js_1.COLORS.reset} ${ctx.pathname}`);
            const startTime = performance.now();
            let n = await next();
            const elapsed = performance.now() - startTime;
            console.log(`${colors_js_1.COLORS.bold}--> ${colors_js_1.COLORS.reset}${colors_js_1.COLORS.bgBlue} ${ctx.method} ${colors_js_1.COLORS.reset} ${ctx.pathname} ` +
                `${colors_js_1.COLORS.yellow}${ctx.getStatus}${colors_js_1.COLORS.reset} ${colors_js_1.COLORS.magenta}${elapsed.toFixed(2)}ms${colors_js_1.COLORS.reset}`);
            return n;
        }
        catch (err) {
            console.error(`${colors_js_1.COLORS.red}Error:${colors_js_1.COLORS.reset}`, err.stack);
            throw new Error(err.stack);
        }
    };
}
