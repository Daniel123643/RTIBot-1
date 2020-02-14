import { Guild, GuildMember } from "discord.js";
import { CommandoClient } from "discord.js-commando";
import { RaidEventService } from "./raids/RaidEventService";
import { PathLike } from "fs";
import * as path from "path";
import { JsonDataStore } from "./base/data_store/JsonDataStore";
import { Logger } from "./Logger";
import { RaidCompositionService } from "./raids/compositions/RaidCompositionService";

/**
 * A statically available set of services instanced for each guild.
 */
export class RtiBotGuild {
    public static get(guild: Guild): RtiBotGuild {
        if (!this.instances[guild.id]) {
            this.instances[guild.id] = new RtiBotGuild(guild);
        }
        return this.instances[guild.id];
    }

    /**
     * Instantiates services for all guilds the bot is in.
     * @param client The client
     * @param rootDataPath The path where guild services should store and load data
     */
    public static instantiateAll(client: CommandoClient, rootDataPath: PathLike) {
        this.rootDataPath = rootDataPath.toString();
        client.guilds.forEach(guild => {
            this.instances[guild.id] = new RtiBotGuild(guild);
        });
    }

    private static instances: { [id: string]: RtiBotGuild } = {};
    private static rootDataPath: string;

    private _eventService: RaidEventService;
    public get raidEventService(): RaidEventService {
        return this._eventService;
    }

    private _compositionService: RaidCompositionService;
    public get raidCompositionService(): RaidCompositionService {
        return this._compositionService;
    }

    private constructor(private guild: Guild) {
        const dataStore = new JsonDataStore(path.join(RtiBotGuild.rootDataPath, guild.id));
        RaidEventService.loadFrom(guild, dataStore).then(service => {
            this._eventService = service;
        });
        RaidCompositionService.loadFrom(guild, dataStore).then(service => {
            this._compositionService = service;
        });
    }

    /**
     * Whether or not a member of the guild can run admin commands
     */
    public hasAdminPrivileges(member: GuildMember): boolean {
        if (member.guild.id !== this.guild.id) {
            Logger.Log(Logger.Severity.Warn, "Checking privileges of member not in guild.");
            return false;
        }
        // TODO: make this dynamic/changeable
        return member.roles.some(role => role.name.toLowerCase() === "admin");
    }

    /**
     * Whether or not a member of the guild can run commands requiring intermediate level (such as managing raid events)
     */
    public hasOfficerPrivileges(member: GuildMember): boolean {
        if (member.guild.id !== this.guild.id) {
            Logger.Log(Logger.Severity.Warn, "Checking privileges of member not in guild.");
            return false;
        }
        // TODO: make this dynamic/changeable
        return this.hasAdminPrivileges(member) || member.roles.some(role => role.name.toLowerCase() === "officer");
    }
}
