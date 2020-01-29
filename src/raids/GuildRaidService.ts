import { CategoryChannel, Guild, TextChannel } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { Util } from "../Util";
import { SortedRaidChannelArray } from "./SortedRaidChannelArray";
import { IRaidEvent } from "./data/RaidEvent";
import { RaidEventChannel } from "./RaidEventChannel";
import { RaidScheduleView } from "./RaidScheduleView";
import { RaidChannelStore } from "./RaidChannelStore";

/**
 * Provides raid services for a guild,
 * i.e. creating and removing raids and raid schedules.
 */
export class GuildRaidService {
    /**
     * Creates a new instance, trying to load saved raid channels from the channel store
     */
    public static async loadFrom(guild: Guild, channelStore: RaidChannelStore): Promise<GuildRaidService> {
        let channels: RaidEventChannel[] | undefined;
        try {
            channels = await channelStore.loadChannels(guild);
        } catch { }
        return new GuildRaidService(guild, channelStore, channels);
    }

    private nextEventId = 0;

    private eventChannels: SortedRaidChannelArray;
    private schedules: RaidScheduleView[] = [];

    private channelCategory: CategoryChannel | undefined;

    private constructor(private guild: Guild, private channelStore: RaidChannelStore, initialChannels?: RaidEventChannel[]) {
        this.eventChannels = new SortedRaidChannelArray(initialChannels);
    }

    /**
     * Adds a new raid event in this guild, creating a channel for it
     * @param raidEvent The event to add
     */
    public async addRaid(raidEvent: IRaidEvent) {
        if (!this.channelCategory) {
            throw new Error("No channel category has been set for raids in this server.");
        }
        raidEvent.id = this.nextEventId++;

        const channel = await this.guild.createChannel(Util.toTextChannelName(raidEvent.name), {
            parent: this.channelCategory,
            position: this.eventChannels.prospectiveIndexOf(raidEvent),  // ensures the channel list is sorted TODO: handle non-raid channels
            type: "text",
        }) as TextChannel;

        const raidChannel = await RaidEventChannel.createInChannel(channel, raidEvent);
        raidChannel.eventChanged.attach(() => {
            this.channelStore.saveChannels(this.eventChannels.data, this.guild);
            this.updateSchedules();
        });
        this.eventChannels.add(raidChannel);
        this.channelStore.saveChannels(this.eventChannels.data, this.guild);

        this.updateSchedules();
    }

    /**
     * Remove an event and its associated channel/view
     * @param raidEvent The event to remove
     */
    public removeRaid(raidEvent: IRaidEvent) {
        const raidChannel = this.eventChannels.removeByEvent(raidEvent);
        if (!raidChannel) { return; }
        raidChannel.channel.delete("Removed by user command");
        this.channelStore.saveChannels(this.eventChannels.data, this.guild);
        this.channelStore.saveDeletedEvent(raidChannel.event, this.guild);
        this.updateSchedules();
    }

    /**
     * Creates a new raid schedule view
     * @param channel The channel to show the schedule in
     */
    public async addScheduleIn(channel: TextChannel) {
        const view = await PersistentView.createInChannel(channel, "Placeholder.");
        this.schedules.push(new RaidScheduleView(view));
        this.updateSchedules();
    }

    /**
     * Sets the channel category to create raid event text channels in
     * @param category The category to use
     */
    public setChannelCategory(category: CategoryChannel) {
        this.channelCategory = category;
    }

    /**
     * Gets the IRaidEvent belonging to a channel, if there is one (i.e. if the channel is a RaidEventChannel)
     * @param channel The channel to retrieve the event for
     */
    public getRaidEventOf(channel: TextChannel): IRaidEvent | undefined {
        return this.eventChannels.data.find((chnl: RaidEventChannel) => chnl.channel === channel)?.event;
    }

    private async updateSchedules() {
        this.schedules.forEach(schedule => {
            schedule.update(this.eventChannels.data);
        });
    }
}
