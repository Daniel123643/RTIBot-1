import { CommandoClient, CommandMessage } from "discord.js-commando";
import * as path from "path";
import { IConfig } from "./Config";
import { Logger } from "./Logger";
import { RtiBotGuild } from "./RtiBotGuild";
import { CategoryChannelArgumentType } from "./base/CategoryChannelArgumentType";
import { TextChannelArgumentType } from "./base/TextChannelArgumentType";
import { UserDialog } from "./base/prompt/UserDialog";
import { RaidRolesArgumentType } from "./base/RaidRolesArgumentType";

class App {
    private client: CommandoClient;

    constructor(private readonly config: IConfig) {}

    public run() {
        this.client = new CommandoClient({
            commandPrefix: this.config.prefix,
            owner: this.config.ownerId,
            unknownCommandResponse: false,
        });
        this.client.registry
            .registerDefaultTypes()
            .registerGroups([
                ["account", "Account linking and management"],
                ["raids", "Raid event creation and management"],
                ["composition", "Raid comps creation and management"],
                ["admin", "Bot management"],
                ["setup", "Setup commands (usually only called once per server)"],
            ])
            .registerType(new RaidRolesArgumentType(this.client, "roles"))
            .registerType(new CategoryChannelArgumentType(this.client))
            .registerType(new TextChannelArgumentType(this.client))
            .registerDefaultGroups()
            .registerDefaultCommands({ eval_: false })
            .registerCommandsIn(path.join(__dirname, "commands"));

        this.client.once("ready", () => {
            Logger.Log(Logger.Severity.Info, "Application started.");
            if (this.config.activityString) {
                this.setStatus();
                this.client.setInterval(this.setStatus.bind(this), 23 * 60 * 60 * 1000);
            }
            RtiBotGuild.instantiateAll(this.client, this.config.dataStoreDirectory);
        });

        this.client.on("error", (error) => {
            Logger.LogError(Logger.Severity.Error, error);
        });
        this.client.on("unknownCommand", (msg: CommandMessage) => {
            if (!UserDialog.hasActiveDialog(msg.author, msg.channel)) {
                msg.reply(`Unknown command. Use \`${this.config.prefix}help\` to view the list of all commands.`);
            }
        });

        this.client.login(this.config.apiKey);
    }

    private setStatus() {
        this.client.user.setActivity(this.config.activityString!);
    }
}

function load_configuration(): IConfig | null {
    let config: string | undefined = process.argv[2];
    if (!config) { config = process.env.RTIBOT_CONFIG; }
    if (!config) {
        Logger.Log(Logger.Severity.Error, "No configuration specified.");
        return null;
    }
    Logger.Log(Logger.Severity.Info, `Using config '${config}'.`);
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
