import { Guild } from "discord.js";
import { CommandoClient } from "discord.js-commando";
import { GuildRaidService } from "./raids/GuildRaidService";
import { PathLike } from "fs";
import { RaidChannelStore } from "./raids/RaidChannelStore";

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
     * @param dataStorePath The path where guild services should store and load data
     */
    public static instantiateAll(client: CommandoClient, dataStorePath: PathLike) {
        this.raidChannelStore = new RaidChannelStore(dataStorePath);
        client.guilds.forEach(guild => {
            this.instances[guild.id] = new RtiBotGuild(guild);
        });
    }

    private static instances: { [id: string]: RtiBotGuild } = {};
    private static raidChannelStore: RaidChannelStore; //  TODO: change so we don't have to keep this reference

    private _raidService: GuildRaidService;
    public get raidService(): GuildRaidService {
        return this._raidService;
    }

    private constructor(guild: Guild) {
        GuildRaidService.loadFrom(guild, RtiBotGuild.raidChannelStore).then(service => {
            this._raidService = service;
        });
    }
}
