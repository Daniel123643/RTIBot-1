import { CategoryChannel, Guild, TextChannel, Collection, DMChannel, GroupDMChannel } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { Util } from "../Util";
import { SortedEventArray } from "./SortedEventArray";
import { RaidEvent } from "./RaidEvent";
import { RaidEventChannel } from "./RaidEventChannel";
import { RaidScheduleView } from "./RaidScheduleView";

/**
 * Provides raid services for a guild,
 * i.e. creating and removing raids and raid schedules.
 */
export class GuildRaidService {
    private nextEventId = 0;

    private events: SortedEventArray;
    private eventChannels: Collection<RaidEvent, RaidEventChannel> = new Collection();
    private schedules: RaidScheduleView[] = [];

    private channelCategory: CategoryChannel | undefined;

    public constructor(private guild: Guild, initialEvents?: RaidEvent[]) {
        this.events = new SortedEventArray(initialEvents);
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

        const channel = await this.guild.createChannel(Util.toTextChannelName(raidEvent.name), {
            parent: this.channelCategory,
            position: this.events.indexOf(raidEvent),  // ensures the channel list is sorted TODO: handle non-raid channels
            type: "text",
        }) as TextChannel;
        const raidChannel = await RaidEventChannel.createInChannel(channel, raidEvent);
        raidChannel.view.eventChanged.attach((event: RaidEvent) => {
            this.events.update(event);
            this.updateSchedules();
        });
        this.eventChannels.set(raidEvent, raidChannel);
    }

    /**
     * Remove an event and any associated channel/view
     * @param raidEvent The event to remove
     */
    public async removeRaid(raidEvent: RaidEvent) {
        this.eventChannels.get(raidEvent)?.channel.delete("Removed by user command");
        this.eventChannels.delete(raidEvent);
        this.events.remove(raidEvent);
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
     * Sets the channel cateogry to create raid event text channels in
     * @param category The category to use
     */
    public setChannelCategory(category: CategoryChannel) {
        this.channelCategory = category;
    }

    /**
     * Gets the RaidEvent belonging to a channel, if there is one (i.e. if the channel is a RaidEventChannel)
     * @param channel The channel to retrieve the event for
     */
    public getRaidEventOf(channel: TextChannel | DMChannel | GroupDMChannel): RaidEvent | undefined {
        return this.eventChannels.findKey((chnl: RaidEventChannel) => chnl.channel === channel);
    }

    private async updateSchedules() {
        this.schedules.forEach(schedule => {
            schedule.update(this.events.data);
        });
    }
}
