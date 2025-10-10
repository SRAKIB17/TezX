import { runtime } from "../utils/runtime.js";
import { colorText } from "../utils/colors.js";
import { TezXError } from "../core/error.js";
function parseEnvFile(filePath, result) {
    try {
        if (runtime !== "deno") {
            throw new TezXError(`Please use ${colorText(`import {loadEnv} from "tezx/${runtime}"`, "bgRed")} environment`);
        }
        let fileExists = false;
        try {
            Deno.statSync(filePath);
            fileExists = true;
        }
        catch {
            fileExists = false;
        }
        if (!fileExists) {
            return;
        }
        let fileContent = new TextDecoder("utf-8").decode(Deno.readFileSync(filePath));
        const lines = fileContent.split("\n");
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith("#"))
                continue;
            const [key, value] = trimmedLine.split("=", 2).map((part) => part.trim());
            if (key && value) {
                const parsedValue = value
                    .replace(/^"(.*)"$/, "$1")
                    .replace(/^'(.*)'$/, "$1");
                result[key] = parsedValue;
                Deno.env.set(key, parsedValue);
            }
        }
    }
    catch (error) {
        console.error(`[dotenv] Error parsing file: ${filePath}`, error);
    }
}
export function loadEnv(basePath = "./") {
    const result = {};
    const envFiles = [
        ".env",
        ".env.local",
        `.env.${process?.env?.NODE_ENV || "development"}`,
        `.env.${process?.env?.NODE_ENV || "development"}.local`,
    ];
    for (const envFile of envFiles) {
        parseEnvFile(`${basePath && basePath?.endsWith("/") ? basePath : `${basePath}/`}${envFile}`, result);
    }
    return result;
}
