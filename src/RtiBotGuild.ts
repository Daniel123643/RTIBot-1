import { Guild } from "discord.js";
import { CommandoClient } from "discord.js-commando";
import { GuildRaidService } from "./raids/GuildRaidService";
import { PathLike } from "fs";
import { RaidEventStore } from "./raids/RaidEventStore";
import { IRaidEvent } from "./raids/data/RaidEvent";

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
    public static loadSavedData(client: CommandoClient, dataStorePath: PathLike) {
        this.raidEventStore = new RaidEventStore(dataStorePath);
        client.guilds.forEach(guild => {
            this.raidEventStore.loadEvents(guild).then(events => {
                this.instances[guild.id] = new RtiBotGuild(guild, events);
            }, _ => {
                this.instances[guild.id] = new RtiBotGuild(guild);
            });
        });
    }

    private static instances: { [id: string]: RtiBotGuild } = {};
    private static raidEventStore: RaidEventStore;

    private _raidService: GuildRaidService;
    get raidService(): GuildRaidService {
        return this._raidService;
    }

    private constructor(guild: Guild, initialEvents?: IRaidEvent[]) {
        this._raidService = new GuildRaidService(guild, RtiBotGuild.raidEventStore, initialEvents);
    }
}
