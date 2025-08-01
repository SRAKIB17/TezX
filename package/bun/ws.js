export function upgradeWebSocket(callback, options = {}) {
    const { onUpgradeError = (error, ctx) => {
        ctx.setStatus = 401;
        return ctx.text(error.message);
    }, } = options;
    return async (ctx, next) => {
        const upgrade = ctx.req.header("upgrade")?.toLowerCase();
        const connection = ctx.req.header("connection")?.toLowerCase();
        const key = ctx.req.header("sec-websocket-key");
        if (upgrade !== "websocket" || !connection?.includes("upgrade") || !key) {
            if (next) {
                ctx.body = { error: "401 Bad Request: Invalid WebSocket headers" };
                return next();
            }
            ctx.setStatus = 401;
            return onUpgradeError(new Error("401 Bad Request: Invalid WebSocket headers"), ctx);
        }
        ctx.wsProtocol = ctx.url?.startsWith("https") ? "wss" : "ws";
        if (!callback) {
            throw new Error("WebSocket callback is missing. Please provide a valid callback function to handle the WebSocket events.");
        }
        let args = ctx.args[0];
        if (!args?.upgrade) {
            return onUpgradeError(new Error("Bun server instance missing for WebSocket"), ctx);
        }
        const success = args.upgrade(ctx.rawRequest, {
            data: callback(ctx)
        });
        if (success)
            return undefined;
        return next();
    };
}
export default upgradeWebSocket;
