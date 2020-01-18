import { CommandoClient } from "discord.js-commando";
import { Guild } from "discord.js";
import { GuildRaidService } from "./raids/GuildRaidService";

export class RtiBotGuild {
    public static get(guild: Guild): RtiBotGuild {
        if (!this.instances[guild.id]) {
            this.instances[guild.id] = new RtiBotGuild(guild);
        }
        return this.instances[guild.id];
    }

    /**
     * Loads saved guild data (events, comps etc.) for all guilds and instantiates services for them
     * @param client The client
     */
    public static loadSavedData(client: CommandoClient) {
    }

    private static instances: { [id: string]: RtiBotGuild } = {};

    private _raidService: GuildRaidService;
    get raidService(): GuildRaidService {
        return this._raidService;
    }

    private constructor(private guild: Guild) {
        this._raidService = new GuildRaidService(guild);
    }
}
