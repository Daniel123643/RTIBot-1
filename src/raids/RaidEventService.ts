import { CategoryChannel, Guild, TextChannel, Snowflake, GuildMember } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { SortedRaidChannelArray } from "./SortedRaidChannelArray";
import { IRaidEvent } from "./data/RaidEvent";
import { RaidEventChannel } from "./RaidEventChannel";
import { RaidScheduleView } from "./RaidScheduleView";
import { RaidChannelStore } from "./stores/RaidChannelStore";
import { RaidScheduleViewStore } from "./stores/RaidScheduleViewStore";
import { IDataStore } from "../base/data_store/DataStore";

/**
 * Provides raid services for a guild.
 * Controls raid event channels (which contain raid event data) and schedules (which list upcoming events)
 */
export class RaidEventService {
    /**
     * Creates a new instance, trying to load saved state from the provided store
     */
    public static async loadFrom(guild: Guild, dataStore: IDataStore): Promise<RaidEventService> {
        const channelStore = new RaidChannelStore(dataStore, guild);
        let channels: RaidEventChannel[] | undefined;
        try {
            channels = await channelStore.loadChannels();
        } catch { }
        const scheduleViewStore = new RaidScheduleViewStore(dataStore, guild);
        let scheduleViews: RaidScheduleView[] | undefined;
        try {
            scheduleViews = await scheduleViewStore.loadScheduleViews();
        } catch { }
        let raidChannelCategory: CategoryChannel | undefined;
        try {
            raidChannelCategory = guild.channels.get(await dataStore.read(this.CATEGORY_RECORD_NAME) as Snowflake) as CategoryChannel;
        } catch { }
        return new RaidEventService(guild, channelStore, scheduleViewStore, dataStore, channels, scheduleViews, raidChannelCategory);
    }

    private static readonly CATEGORY_RECORD_NAME = "category";

    private nextEventId = 0;

    private eventChannels: SortedRaidChannelArray;
    private schedules: RaidScheduleView[];

    private channelCategory: CategoryChannel | undefined;

    /**
     * Create a new raid service.
     * @param guild The guild this service is for
     * @param channelStore The store used for raid channels & event data
     * @param scheduleStore The store used for schedule views
     * @param genericStore The store used for other misc. things
     * @param initialChannels Loaded raid channels to control
     * @param initialSchedules Loaded schedules to control
     * @param raidChannelCategory The category to create new raid channels in
     */
    private constructor(private guild: Guild,
                        private channelStore: RaidChannelStore,
                        private scheduleStore: RaidScheduleViewStore,
                        private genericStore: IDataStore,
                        initialChannels?: RaidEventChannel[],
                        initialSchedules?: RaidScheduleView[],
                        raidChannelCategory?: CategoryChannel) {
        this.eventChannels = new SortedRaidChannelArray(initialChannels);
        this.schedules = initialSchedules ? initialSchedules : [];
        this.channelCategory = raidChannelCategory;
        if (initialChannels) {
            for (const channel of initialChannels) {
                channel.eventChanged.attach(this.onEventChanged.bind(this));
            }
        }
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

        const raidChannel = await RaidEventChannel.createInGuild(this.guild, this.channelCategory, raidEvent);
        raidChannel.eventChanged.attach(this.onEventChanged.bind(this));
        this.eventChannels.add(raidChannel);
        this.channelStore.saveChannels(this.eventChannels.data);

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
        this.channelStore.saveChannels(this.eventChannels.data);
        this.channelStore.saveDeletedEvent(raidChannel.event);
        this.updateSchedules();
    }

    /**
     * Creates a new raid schedule view
     * @param channel The channel to show the schedule in
     */
    public async addScheduleIn(channel: TextChannel) {
        const view = await PersistentView.createInChannel(channel, "Placeholder.");
        const schedule = new RaidScheduleView(view);
        this.schedules.push(schedule);
        this.scheduleStore.saveScheduleViews(this.schedules);
        this.updateSchedules();
    }

    /**
     * Sets the channel category to create raid event text channels in
     * @param category The category to use
     */
    public setChannelCategory(category: CategoryChannel) {
        this.channelCategory = category;
        this.genericStore.write(RaidEventService.CATEGORY_RECORD_NAME, category.id);
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

    private onEventChanged() {
        this.channelStore.saveChannels(this.eventChannels.data);
        this.updateSchedules();
    }
}
