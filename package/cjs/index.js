"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.useParams = exports.TezX = exports.Router = void 0;
var router_js_1 = require("./core/router.js");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_js_1.Router; } });
var server_js_1 = require("./core/server.js");
Object.defineProperty(exports, "TezX", { enumerable: true, get: function () { return server_js_1.TezX; } });
var params_js_1 = require("./utils/params.js");
Object.defineProperty(exports, "useParams", { enumerable: true, get: function () { return params_js_1.useParams; } });
exports.version = "1.0.50";
