import { IRaidEvent } from "./data/RaidEvent";
import { Guild } from "discord.js";
import { JsonDataStore } from "../base/DataStore";

/**
 * Stores and loads raid events on disk
 */
export class RaidEventStore extends JsonDataStore {
    /**
     * Save all events for a guild to the disk, allowing them to later be loaded.
     * @param events The events to save
     * @param guild The guild the events belong to
     */
    public async saveEvents(events: IRaidEvent[], guild: Guild) {
        await this.write(this.getRecordName(guild), events);
    }

    public loadEvents(guild: Guild): Promise<IRaidEvent[]> {
        return this.read(this.getRecordName(guild));
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
