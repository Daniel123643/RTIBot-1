export namespace Logger {
    export enum Severity {
        Debug = "Debug",
        Info = "Info",
        Warn = "Warn",
        Error = "Error",
    }
    export function Log(severity: Severity, msg: string) {
        const timeStr = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
        const formattedMsg = `[${timeStr}][${severity}] ${msg}`;
        console.log(formattedMsg);
    }
}
