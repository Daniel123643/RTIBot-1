import { CommandoClient } from "discord.js-commando";
import * as path from "path";
import { IConfig } from "./Config";
import { Logger } from "./Logger";
import { RaidRolesArgumentType } from "./RaidRolesArgumentType";
import { RtiBotGuild } from "./RtiBotGuild";
import { CategoryChannelArgumentType } from "./base/CategoryChannelArgumentType";
import { TextChannelArgumentType } from "./base/TextChannelArgumentType";

class App {
    constructor(private config: IConfig) {}

    public run() {
        const client = new CommandoClient({
            commandPrefix: this.config.prefix,
            owner: this.config.ownerId,
        });
        client.registry
            .registerDefaultTypes()
            .registerGroups([
                ["account", "Account linking and management"],
                ["raids", "Raid event creation and management"],
                ["composition", "Raid comps creation and management"],
                ["admin", "Bot management"],
                ["setup", "Setup commands (usually only called once per server)"],
            ])
            .registerType(new RaidRolesArgumentType(client, "roles"))
            .registerType(new CategoryChannelArgumentType(client))
            .registerType(new TextChannelArgumentType(client))
            .registerDefaultGroups()
            .registerDefaultCommands({ eval_: false })
            .registerCommandsIn(path.join(__dirname, "commands"));

        client.once("ready", () => {
            Logger.Log(Logger.Severity.Info, "Application started.");
            if (this.config.activityString) {
                client.user.setActivity(this.config.activityString);
            }
            RtiBotGuild.loadSavedData(client);
        });
        client.on("error", (error) => {
            Logger.LogError(Logger.Severity.Error, error);
        });
        client.login(this.config.apiKey);
    }
}

function load_configuration(): IConfig | null {
    let config: string | undefined = process.argv[2];
    if (!config) { config = process.env.RTIBOT_CONFIG }
    if (!config) {
        Logger.Log(Logger.Severity.Error, "No configuration specified.");
        return null;
    }
    let confFile: string;
    switch (config) {
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

process.on("uncaughtException", (error) => Logger.LogError(Logger.Severity.Error, error));
const conf = load_configuration();
if (conf) {
    new App(conf).run();
}
