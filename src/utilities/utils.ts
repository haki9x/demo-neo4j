import { ENV } from "./EWindow";

export function getConfigFromWindowBrowser(name: ENV) {
    if (typeof document === "undefined") {
        // running in a server environment
        return null
    } else {
        // running in a browser environment
        return (window as any)?.env?.[name]
    }
}