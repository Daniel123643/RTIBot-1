import { Guild } from "discord.js";
import { CommandoClient } from "discord.js-commando";
import { GuildRaidService } from "./raids/GuildRaidService";
import { PathLike } from "fs";
import * as path from "path";
import { JsonDataStore } from "./base/data_store/JsonDataStore";

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

    private _raidService: GuildRaidService;
    public get raidService(): GuildRaidService {
        return this._raidService;
    }

    private constructor(guild: Guild) {
        const dataStore = new JsonDataStore(path.join(RtiBotGuild.rootDataPath, guild.id));
        GuildRaidService.loadFrom(guild, dataStore).then(service => {
            this._raidService = service;
        });
    }
}
