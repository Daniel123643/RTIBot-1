import { CommandoClient, CommandoClientOptions } from "discord.js-commando";
import * as path from "path";
import { IConfig } from "./Config";
import { Logger } from "./Logger";
import { RaidRolesArgumentType } from "./RaidRolesArgumentType";
import { GuildRaidService } from "./raids/GuildRaidService";
import { RtiBotGuild } from "./RtiBotGuild";

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
            ])
            .registerType(new RaidRolesArgumentType(client, "roles"))
            .registerDefaultGroups()
            .registerDefaultCommands({ eval_: false })
            .registerCommandsIn(path.join(__dirname, "commands"));

        client.once("ready", () => {
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

process.on("uncaughtException", (error) => Logger.LogError(Logger.Severity.Error, error));
const conf = load_configuration();
if (conf) {
    new App(conf).run();
}
