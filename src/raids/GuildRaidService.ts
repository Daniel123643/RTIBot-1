import { Guild, TextChannel } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { Util } from "../Util";
import { RaidEvent } from "./RaidEvent";
import { RaidEventController } from "./RaidEventController";
import { RaidScheduleController } from "./RaidScheduleController";

/**
 * Provides raid services for a guild
 */
export class GuildRaidService {
    private nextEventId = 0;

    private events: RaidEvent[] = [];
    private scheduleControllers: RaidScheduleController[] = [];

    public constructor(private guild: Guild) {}

    /**
     * Adds a new raid event in this guild, creating a channel for it
     * @param raidEvent The event to add
     */
    public async addRaid(raidEvent: RaidEvent) {
        raidEvent.id = this.nextEventId++;
        const channel = await this.guild.createChannel(Util.toTextChannelName(raidEvent.name), {
            type: "text",
        }) as TextChannel;
        RaidEventController.createInChannel(channel, raidEvent);
        this.events.push(raidEvent);
        this.updateSchedules();
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
            ctr.updateView(this.events);
        });
    }
}