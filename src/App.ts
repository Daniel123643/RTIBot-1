import { Client } from "discord.js";
import { IConfig } from "./Config";
import { Logger } from "./Logger";

class App {
    constructor(private config: IConfig) {}

    public run() {
        Logger.Log(Logger.Severity.Info, "asdf");
        const client = new Client();
        client.once("ready", () => {
            Logger.Log(Logger.Severity.Info, "Ready");
        });
        // client.login(config.apiKey);
    }
}

function load_configuration(): IConfig | null {
    if (process.argv.length < 3) {
        Logger.Log(Logger.Severity.Error, "No configuration specified.");
        return null;
    }
    let confFile: string;
    switch (process.argv[2]) {
        case "Release":
            confFile = "../Config.json";
            break;
        case "Debug":
            confFile = "../ConfigDebug.json";
            break;
        default:
            Logger.Log(Logger.Severity.Error, "Invalid configuration name.");
            return null;
    }
    return require(confFile);
}

const conf = load_configuration();
if (conf) {
    new App(conf).run();
}
