import { Middleware } from "../../types/index.js";
export type SanitizeHeadersOptions = {
    /**
     * 🟢 Whitelist of allowed headers (case-insensitive)
     * @default [] (allow all if empty)
     * @example
     * whitelist: ['content-type', 'authorization'] // Only allow these headers
     */
    whitelist?: string[];
    /**
     * 🔴 Blacklist of disallowed headers (case-insensitive)
     * @default [] (block none if empty)
     * @example
     * blacklist: ['x-powered-by', 'server'] // Block server info headers
     */
    blacklist?: string[];
    /**
     * 🟠 Allow potentially unsafe characters in header values
     * @default false
     * @warning Enabling this may reduce security
     * @example
     * allowUnsafeCharacters: true // Allow CR/LF in headers
     */
    allowUnsafeCharacters?: boolean;
};
/**
 * 🧼 Middleware to sanitize HTTP headers for security and compliance
 *
 * Removes dangerous headers, enforces allow/block lists, and normalizes headers.
 * Protects against header injection and information leakage.
 *
 * @param {SanitizeHeadersOptions} [options={}] - Configuration options
 * @returns {Middleware} Middleware function
 *
 * @example
 * // Basic usage with defaults
 * app.use(sanitizeHeaders());
 *
 * // Strict configuration
 * app.use(sanitizeHeaders({
 *   whitelist: ['accept', 'content-type'],
 *   normalizeKeys: true
 * }));
 */
declare const sanitizeHeaders: (options?: SanitizeHeadersOptions) => Middleware;
export { sanitizeHeaders as default, sanitizeHeaders };
