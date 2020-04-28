import { Guild } from "discord.js";
import { RaidEventChannel } from "../RaidEventChannel";
import { Util } from "../../Util";
import { Logger } from "../../Logger";
import { IDataStore } from "../../base/data_store/DataStore";
import { RaidEvent } from "../data/RaidEvent";

/**
 * Stores and loads raid channel & event data on disk
 */
export class RaidChannelStore {
    private static readonly RECORD_NAME = "raids";

    public constructor(private readonly dataStore: IDataStore, private readonly guild: Guild) { }

    /**
     * Save all raid channels (incl. their events) for the guild to the disk, allowing them to later be loaded.
     * @param channels The events to save
     */
    public async saveChannels(channels: RaidEventChannel[]) {
        const prms = channels.map(ch => ch.toObj());
        const objs = Promise.all(prms);
        await this.dataStore.write(RaidChannelStore.RECORD_NAME, objs);
    }

    /**
     * Loads all saved raid channels for the guild.
     */
    public async loadChannels(): Promise<RaidEventChannel[]> {
        const savedData = await this.dataStore.read(RaidChannelStore.RECORD_NAME);
        const promises = (savedData as object[]).map(channelData => {
            return RaidEventChannel.fromObj(this.guild, channelData);
        });
        let results = await Util.allSettled(promises);
        results = results.filter(res => {
            if (!res.successful) { Logger.Log(Logger.Severity.Warn, "Unable to load saved event: " + res.error); }
            return res.successful;
        });
        Logger.Log(Logger.Severity.Info, `Loaded ${results.length} raid channels for ${this.guild.name}.`);
        return results.map(res => res.value!);
    }

    /**
     * Dump a deleted event in the interest of traceability/recoverability.
     * These aren't meant to normally be loaded after being saved.
     * @param event The event to save
     */
    public async saveDeletedEvent(event: RaidEvent) {
        this.dataStore.append("deleted_events", event);
    }
}
