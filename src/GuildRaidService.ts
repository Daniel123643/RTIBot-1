import { Guild, TextChannel } from "discord.js";
import { CommandoClient } from "discord.js-commando";
import { RaidEvent } from "./RaidEvent";
import { Util } from "./Util";
import { RaidEventController } from "./RaidEventController";
import { RaidScheduleController } from "./RaidScheduleController";
import { PersistentView } from "./base/PersistentView";

/**
 * Provides raid services for a guild
 */
export class GuildRaidService {
    public static getInstance(guild: Guild): GuildRaidService {
        if (!this.instances[guild.id]) {
            this.instances[guild.id] = new GuildRaidService(guild);
        }
        return this.instances[guild.id];
    }

    public static instantiateWithSavedData(client: CommandoClient) {
        this.client = client;
    }

    private static instances: { [id: string]: GuildRaidService } = {};
    private static client: CommandoClient;

    private events: RaidEvent[] = [];
    private scheduleControllers: RaidScheduleController[] = [];
    private constructor(private guild: Guild) {}

    public async addRaid(raidEvent: RaidEvent) {
        // const channel = await this.guild.createChannel(Util.toTextChannelName(raidEvent.name), {
        //     type: "text",
        // }) as TextChannel;
        // RaidEventController.createInChannel(channel, raidEvent);
        this.events.push(raidEvent);
        this.updateSchedules();
    }

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