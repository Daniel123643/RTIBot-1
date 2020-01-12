import { Message } from "discord.js";

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

    export function LogMessage(severity: Severity, message: Message) {
        Log(severity, `msg: ${message.author.username} - ${message.content}`);
    }

    export function LogError(severity: Severity, error: Error) {
        Log(severity, `err: ${error.name} - ${error.message} | ${error.stack}`);
    }
}
