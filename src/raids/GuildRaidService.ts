import { Guild, TextChannel, CategoryChannel } from "discord.js";
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

    public constructor(private guild: Guild) {}

    /**
     * Adds a new raid event in this guild, creating a channel for it
     * @param raidEvent The event to add
     */
    public async addRaid(raidEvent: RaidEvent) {
        raidEvent.id = this.nextEventId++;
        this.events.add(raidEvent);
        this.updateSchedules();

        const channel = await this.guild.createChannel(Util.toTextChannelName(raidEvent.name), {
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

    private async updateSchedules() {
        this.scheduleControllers.forEach(ctr => {
            ctr.updateView(this.events.data);
        });
    }
}
