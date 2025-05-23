"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadersParser = void 0;
class HeadersParser {
    headers = new Map();
    constructor(init) {
        if (init) {
            this.add(init);
        }
    }
    add(headers) {
        if (Array.isArray(headers)) {
            for (const [key, value] of headers) {
                this.set(key, value);
            }
        }
        else if (typeof Headers !== "undefined" && headers instanceof Headers) {
            for (const [key, value] of headers.entries()) {
                this.set(key, value);
            }
        }
        else if (typeof headers === "object") {
            for (const key in headers) {
                if (Object.prototype.hasOwnProperty.call(headers, key)) {
                    this.set(key, headers[key]);
                }
            }
        }
        return this;
    }
    set(key, value) {
        this.headers.set(key.toLowerCase(), Array.isArray(value) ? value : [value]);
        return this;
    }
    clear() {
        this.headers.clear();
        return this;
    }
    get(key) {
        const values = this.headers.get(key.toLowerCase());
        return values ? values[0] : undefined;
    }
    getAll(key) {
        return this.headers.get(key.toLowerCase()) || [];
    }
    has(key) {
        return this.headers.has(key.toLowerCase());
    }
    delete(key) {
        return this.headers.delete(key.toLowerCase());
    }
    append(key, value) {
        const lowerKey = key.toLowerCase();
        if (this.headers.has(lowerKey)) {
            this.headers.get(lowerKey).push(value);
        }
        else {
            this.headers.set(lowerKey, [value]);
        }
        return this;
    }
    entries() {
        return this.headers.entries();
    }
    keys() {
        return this.headers.keys();
    }
    values() {
        return this.headers.values();
    }
    forEach(callback) {
        for (const [key, value] of this.headers) {
            callback(value, key);
        }
    }
    toObject() {
        const obj = {};
        for (const [key, value] of this.headers.entries()) {
            obj[key] = value.length > 1 ? value : value[0];
        }
        return obj;
    }
    toJSON() {
        const obj = {};
        for (const [key, value] of this.headers.entries()) {
            obj[key] = Array.isArray(value) ? value.join(", ") : value;
        }
        return obj;
    }
}
exports.HeadersParser = HeadersParser;
Object.defineProperty(HeadersParser, "name", { value: "Headers" });
