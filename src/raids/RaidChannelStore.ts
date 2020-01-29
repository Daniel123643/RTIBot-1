import { IRaidEvent } from "./data/RaidEvent";
import { Guild } from "discord.js";
import { JsonDataStore } from "../base/DataStore";
import { RaidEventChannel } from "./RaidEventChannel";
import { Util } from "../Util";
import { Logger } from "../Logger";

/**
 * Stores and loads raid events on disk
 */
export class RaidChannelStore extends JsonDataStore {
    /**
     * Save all raid channels (incl. their events) for a guild to the disk, allowing them to later be loaded.
     * @param channels The events to save
     * @param guild The guild the channels belong to
     */
    public async saveChannels(channels: RaidEventChannel[], guild: Guild) {
        const objs = channels.map(ch => ch.toObj());
        await this.write(this.getRecordName(guild), objs);
    }

    /**
     * Loads all saved raid channels for a guild.
     * @param guild The guild to load channels for
     */
    public async loadChannels(guild: Guild): Promise<RaidEventChannel[]> {
        const savedData = await this.read(this.getRecordName(guild));
        const promises = (savedData as object[]).map(channelData => {
            return RaidEventChannel.fromObj(guild, channelData);
        });
        let results = await Util.allSettled(promises);
        results = results.filter(res => {
            if (!res.successful) { Logger.Log(Logger.Severity.Warn, "Unable to load saved event: " + res.error); }
            return res.successful;
        });
        return results.map(res => res.value!);
    }

    /**
     * Dump a deleted event in the interest of traceability/recoverability.
     * These aren't meant to normally be loaded after being saved.
     * @param event The event to save
     */
    public async saveDeletedEvent(event: IRaidEvent, guild: Guild) {
        event["guild"] = guild.id;
        this.append("deleted_events", event);
    }

    private getRecordName(guild: Guild) {
        return "raids_" + guild.id;
    }
}
