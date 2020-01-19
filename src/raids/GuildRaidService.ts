import { CategoryChannel, Guild, TextChannel } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { Util } from "../Util";
import { RaidEvent } from "./RaidEvent";
import { RaidEventArray } from "./RaidEventArray";
import { RaidEventChannel } from "./RaidEventChannel";
import { RaidScheduleController } from "./RaidScheduleController";

/**
 * Provides raid services for a guild
 */
export class GuildRaidService {
    private nextEventId = 0;

    private events = new RaidEventArray();
    private scheduleControllers: RaidScheduleController[] = [];

    private channelCategory: CategoryChannel | undefined;

    public constructor(private guild: Guild) {
    }

    /**
     * Adds a new raid event in this guild, creating a channel for it
     * @param raidEvent The event to add
     */
    public async addRaid(raidEvent: RaidEvent) {
        if (!this.channelCategory) {
            throw new Error("No channel category has been set for raids in this server.");
        }
        raidEvent.id = this.nextEventId++;
        this.events.add(raidEvent);
        this.updateSchedules();

        const channel = await this.guild.channels.create(Util.toTextChannelName(raidEvent.name), {
            parent: this.channelCategory,
            position: this.events.indexOf(raidEvent),  // ensures the channel list is sorted
            type: "text",
        }) as TextChannel;
        await RaidEventChannel.createInChannel(channel, raidEvent);
    }

    /**
     * Creates a new raid schedule view
     * @param channel The channel to show the schedule in
     */
    public async addScheduleIn(channel: TextChannel) {
        const view = await PersistentView.createInChannel(channel, "Placeholder.");
        this.scheduleControllers.push(new RaidScheduleController(view));
        this.updateSchedules();
    }

    /**
     * Sets the channel cateogry to create raid event text channels in
     * @param category The category to use
     */
    public setChannelCategory(category: CategoryChannel) {
        this.channelCategory = category;
    }

    private async updateSchedules() {
        this.scheduleControllers.forEach(ctr => {
            ctr.updateView(this.events.data);
        });
    }
}
