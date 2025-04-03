import { EnvironmentDetector } from "./environment";
import { HeadersParser } from "./header";
import { Request } from "./request";
import { State } from "./utils/state";
import { defaultMimeType, mimeTypes } from "./utils/staticFile";
export const httpStatusMap = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    306: "Switch Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a Teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
};
// export type ResponseOption = {
//     statusText?: string; // Optional status text (e.g., "OK", "Not Found")
//     headers?: ResponseHeaders;
// } | ResponseHeaders
// Action
// Simple Name
// Descriptive Name
// Set a value
// store()
// setItem(), add()
// Get a value
// fetch()
// retrieve(), getItem()
// Delete a value
// remove()
// discard(), deleteItem()
// Get all values
// list()
// getAll(), dump()
// Clear everything
// clear()
// wipe(), reset()
export class Context {
    #rawRequest;
    /**
     * Environment variables and configuration
     * @type {object}
     */
    env = {};
    /**
     * Parser for handling and manipulating HTTP headers
     * @type {HeadersParser}
     */
    headers = new HeadersParser();
    /**
     * Parser for handling and manipulating HTTP response(Read Only)
     * @type {Response}
     */
    res;
    /**
     * Request path without query parameters
     * @type {string}
     */
    pathname;
    /**
     * Full request URL including protocol and query string
     * @type {string}
     */
    url;
    /**
     * HTTP request method (GET, POST, PUT, DELETE, etc.)
     * @type {HTTPMethod}
     */
    method;
    #status = 200;
    /**
     * Public state container for application data
     * state storage for middleware and plugins
     * @type {State}
     */
    state = new State();
    /**
     * URL parameters extracted from route
     * @private
     * @type {Record<string, any>}
     */
    #params = {};
    // /**
    //  * WebSocket connection instance (null until upgraded)
    //  * @type {WebSocket | null}
    //  */
    // ws: WebSocket | null = null;
    #localAddress = {};
    #remoteAddress = {};
    constructor(req, connInfo) {
        // this.status = this.status.bind(this);
        this.#rawRequest = req;
        this.#remoteAddress = connInfo.remoteAddr;
        this.#localAddress = connInfo.localAddr;
        this.method = req?.method?.toUpperCase();
        this.pathname = this.req.urlRef.pathname;
        this.url = this.req.url;
    }
    /**
     * Cookie handling utility with get/set/delete operations
     * @returns {{
     *  get: (name: string) => string | undefined,
     *  all: () => Record<string, string>,
     *  delete: (name: string, options?: CookieOptions) => void,
     *  set: (name: string, value: string, options?: CookieOptions) => void
     * }} Cookie handling interface
     */
    /**
     * Sets a header value.
     * @param key - Header name.
     * @param value - Header value(s).
     */
    header(key, value) {
        this.headers.set(key, value);
        return this;
    }
    get cookies() {
        const c = this.headers.getAll("cookie");
        let cookies = {};
        if (Array.isArray(c) && c.length != 0) {
            const cookieHeader = c.join("; ").split(";");
            for (const pair of cookieHeader) {
                const [key, value] = pair?.trim()?.split("=");
                cookies[key] = decodeURIComponent(value);
            }
        }
        else if (typeof c == "string") {
            const cookieHeader = c.split(";");
            for (const pair of cookieHeader) {
                const [key, value] = pair?.trim()?.split("=");
                cookies[key] = decodeURIComponent(value);
            }
        }
        return {
            /**
             * Get a specific cookie by name.
             * @param {string} cookie - The name of the cookie to retrieve.
             * @returns {string | undefined} - The cookie value or undefined if not found.
             */
            get: (cookie) => {
                return cookies?.[cookie];
            },
            /**
             * Get all cookies as an object.
             * @returns {Record<string, string>} - An object containing all cookies.
             */
            all: () => {
                return cookies;
            },
            /**
             * Delete a cookie by setting its expiration to the past.
             * @param {string} name - The name of the cookie to delete.
             * @param {CookieOptions} [options] - Additional cookie options.
             */
            delete: (name, options) => {
                const value = "";
                const cookieOptions = {
                    ...options,
                    expires: new Date(0), // Set expiration time to the past
                };
                const cookieHeader = `${name}=${value};${serializeOptions(cookieOptions)}`;
                this.headers.set("Set-Cookie", cookieHeader);
            },
            /**
             * Set a new cookie with the given name, value, and options.
             * @param {string} name - The name of the cookie.
             * @param {string} value - The value of the cookie.
             * @param {CookieOptions} [options] - Additional options like expiration.
             */
            set: (name, value, options) => {
                const cookieHeader = `${name}=${value};${serializeOptions(options || {})}`;
                this.headers.set("Set-Cookie", cookieHeader);
            },
        };
    }
    json(body, ...args) {
        let status = this.#status;
        let headers = {
            "Content-Type": "application/json; charset=utf-8",
        };
        if (typeof args[0] === "number") {
            status = args[0];
            if (typeof args[1] === "object") {
                headers = { ...headers, ...args[1] };
            }
        }
        else if (typeof args[0] === "object") {
            headers = { ...headers, ...args[0] };
        }
        return this.#handleResponse(JSON.stringify(body), {
            status: status,
            headers: headers,
        });
    }
    send(body, ...args) {
        let status = this.#status;
        let headers = {};
        if (typeof args[0] === "number") {
            status = args[0];
            if (typeof args[1] === "object") {
                headers = args[1];
            }
        }
        else if (typeof args[0] === "object") {
            headers = args[0];
        }
        if (!headers["Content-Type"]) {
            if (typeof body === "string") {
                headers["Content-Type"] = "text/plain;";
            }
            else if (typeof body === "object" && body !== null) {
                headers["Content-Type"] = "application/json;";
                body = JSON.stringify(body);
            }
            else {
                headers["Content-Type"] = "application/octet-stream";
            }
        }
        return this.#handleResponse(body, {
            status: status,
            headers,
        });
    }
    html(data, ...args) {
        let status = this.#status;
        let headers = {
            "Content-Type": "text/html; charset=utf-8",
        };
        if (typeof args[0] === "number") {
            status = args[0];
            if (typeof args[1] === "object") {
                headers = { ...headers, ...args[1] };
            }
        }
        else if (typeof args[0] === "object") {
            headers = { ...headers, ...args[0] };
        }
        return this.#handleResponse(data, {
            status: status,
            headers: headers,
        });
    }
    text(data, ...args) {
        let status = this.#status;
        let headers = {
            "Content-Type": "text/plain; charset=utf-8",
        };
        if (typeof args[0] === "number") {
            status = args[0];
            if (typeof args[1] === "object") {
                headers = { ...headers, ...args[1] };
            }
        }
        else if (typeof args[0] === "object") {
            headers = { ...headers, ...args[0] };
        }
        return this.#handleResponse(data, {
            status: status,
            headers: headers,
        });
    }
    xml(data, ...args) {
        let status = this.#status;
        let headers = {
            "Content-Type": "application/xml; charset=utf-8",
        };
        if (typeof args[0] === "number") {
            status = args[0];
            if (typeof args[1] === "object") {
                headers = { ...headers, ...args[1] };
            }
        }
        else if (typeof args[0] === "object") {
            headers = { ...headers, ...args[0] };
        }
        return this.#handleResponse(data, {
            status: status,
            headers: headers,
        });
    }
    /**
     * HTTP status code..
     * @param status - number.
     * @returns Response object with context all method.
     */
    status = (status) => {
        this.#status = status;
        return this;
    };
    set setStatus(status) {
        this.#status = status;
    }
    get getStatus() {
        return this.#status;
    }
    /**
     * Redirects to a given URL.
     * @param url - The target URL.
     * @param status - (Optional) HTTP status code (default: 302).
     * @returns Response object with redirect.
     */
    redirect(url, status = 302) {
        return new Response(null, {
            status: status,
            headers: { Location: url },
        });
    }
    /**
     * Handles file downloads.
     * @param filePath - The path to the file.
     * @param fileName - The name of the downloaded file.
     * @returns Response object for file download.
     */
    async download(filePath, fileName) {
        try {
            // Ensure the file exists
            let fileExists = false;
            const runtime = EnvironmentDetector.getEnvironment;
            if (runtime === "node") {
                const { existsSync } = await import("fs");
                fileExists = existsSync(filePath);
            }
            else if (runtime === "bun") {
                fileExists = Bun.file(filePath).exists();
            }
            else if (runtime === "deno") {
                try {
                    await Deno.stat(filePath);
                    fileExists = true;
                }
                catch {
                    fileExists = false;
                }
            }
            if (!fileExists) {
                throw Error("File not found");
            }
            // Read the file content based on the runtime
            let fileBuffer;
            if (runtime === "node") {
                const { readFileSync } = await import("fs");
                fileBuffer = await readFileSync(filePath);
            }
            else if (runtime === "bun") {
                fileBuffer = await Bun.file(filePath)
                    .arrayBuffer()
                    .then((buf) => new Uint8Array(buf));
            }
            else if (runtime === "deno") {
                fileBuffer = await Deno.readFile(filePath);
            }
            // Return the file as a downloadable response
            return this.#handleResponse(fileBuffer, {
                status: 200,
                headers: {
                    "Content-Disposition": `attachment; filename="${fileName}"`,
                    "Content-Type": "application/octet-stream",
                    "Content-Length": fileBuffer.byteLength.toString(),
                },
            });
        }
        catch (error) {
            throw Error("Internal Server Error" + error?.message);
        }
    }
    async sendFile(filePath, ...args) {
        try {
            const runtime = EnvironmentDetector.getEnvironment;
            // Resolve the absolute path to the file
            const resolvedPath = filePath;
            // const resolvedPath =
            //     runtime === "node" ? join(process.cwd(), filePath) : filePath;
            // Check if the file exists
            let fileExists = false;
            if (runtime === "node") {
                const { existsSync } = await import("fs");
                fileExists = existsSync(resolvedPath);
            }
            else if (runtime === "bun") {
                fileExists = Bun.file(resolvedPath).exists();
            }
            else if (runtime === "deno") {
                try {
                    await Deno.stat(resolvedPath);
                    fileExists = true;
                }
                catch {
                    fileExists = false;
                }
            }
            if (!fileExists) {
                throw Error("File not found");
            }
            // Read file stats (size)
            let fileSize = 0;
            if (runtime === "node") {
                const { statSync } = await import("fs");
                fileSize = statSync(resolvedPath).size;
            }
            else if (runtime === "bun") {
                fileSize = (await Bun.file(resolvedPath).arrayBuffer()).byteLength;
            }
            else if (runtime === "deno") {
                const fileInfo = await Deno.stat(resolvedPath);
                fileSize = fileInfo.size;
            }
            const ext = filePath.split(".").pop()?.toLowerCase() || "";
            const mimeType = mimeTypes[ext] || defaultMimeType;
            // Create a readable stream for the file
            let fileStream;
            if (runtime === "node") {
                const { createReadStream } = await import("fs");
                fileStream = createReadStream(resolvedPath);
            }
            else if (runtime === "bun") {
                fileStream = Bun.file(resolvedPath).stream();
            }
            else if (runtime === "deno") {
                const file = await Deno.open(resolvedPath, { read: true });
                fileStream = file.readable;
            }
            // Build headers
            let headers = {
                "Content-Type": mimeType,
                "Content-Length": fileSize.toString(),
            };
            let fileName = "";
            if (typeof args[0] === "string") {
                fileName = args[0];
                if (typeof args[1] === "object") {
                    headers = { ...headers, ...args[1] };
                }
            }
            else if (typeof args[0] === "object") {
                headers = { ...headers, ...args[0] };
            }
            // Add Content-Disposition header if fileName is provided
            if (fileName) {
                headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
            }
            // Return the file as a Response object
            return this.#handleResponse(fileStream, {
                status: 200,
                headers,
            });
        }
        catch (error) {
            throw Error("Internal Server Error" + error?.message);
        }
    }
    #handleResponse(body, { headers, status }) {
        let response = new Response(body, {
            status: status,
            headers,
        });
        let clone = response.clone();
        this.res = response;
        // console.log(this.res)
        return clone;
    }
    // get res() {
    //   return this.res;
    // }
    // set res(res: Response) {
    //   this.res = res;
    // }
    /**
     * Getter that creates a standardized Request object from internal state
     * @returns {Request} - Normalized request object combining:
     * - Raw platform-specific request
     * - Parsed headers
     * - Route parameters
     *
     * @example
     * // Get standardized request
     * const request = ctx.req;
     * // Access route params
     * const id = request.params.get('id');
     */
    get req() {
        return new Request(this.#rawRequest, this.params, this.#remoteAddress);
    }
    // attachWebSocket(ws) {
    //     this.ws = ws;
    // }
    set params(params) {
        this.#params = params;
    }
    get params() {
        return this.#params;
    }
}
function serializeOptions(options) {
    const parts = [];
    if (options.maxAge) {
        parts.push(`Max-Age=${options.maxAge}`);
    }
    if (options.expires) {
        parts.push(`Expires=${options.expires.toUTCString()}`);
    }
    if (options.path) {
        parts.push(`Path=${options.path}`);
    }
    if (options.domain) {
        parts.push(`Domain=${options.domain}`);
    }
    if (options.secure) {
        parts.push(`Secure`);
    }
    if (options.httpOnly) {
        parts.push(`HttpOnly`);
    }
    if (options.sameSite) {
        parts.push(`SameSite=${options.sameSite}`);
    }
    return parts.join("; ");
}
