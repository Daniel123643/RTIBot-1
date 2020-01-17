import { TextChannel, Message, Snowflake } from "discord.js";
import { RaidEventController } from "./RaidEventController";
import { CommandMessage } from "discord.js-commando";
import { Logger } from "./Logger";
import { RaidEvent } from "./RaidEvent";

/**
 * Controls a channel displaying a raid schedule (i.e. a set of raid events)
 */
export class RaidScheduleChannel {

    /**
     * Creates a new raid schedule in the given channel. Raids added to the schedule will be shown as interactive
     * messages in the channel. You may also provide a set of previous messages to load/attach, to restore a schedule
     * after restarting the bot.
     * @param channel The channel to use for the schedule
     * @param messageIds Raid events and ids of associated messages to load from the channel
     */
    public static async createInChannel(channel: TextChannel,
                                        eventsToLoad: Array<[RaidEvent, Snowflake]>): Promise<RaidScheduleChannel> {
        const msgFetch = eventsToLoad.map(async event => {
            try {
                const msg = await channel.fetchMessage(event[1]);
                return { status: "success", data: RaidEventController.loadFromMessage(msg, event[0]) };
            } catch (reason) {
                // TODO: delete event from db
                Logger.Log(Logger.Severity.Warn, `Unable to load raid message ${event[1]} in ${channel.name}: ${reason}`);
                return { status: "failure", data: undefined };
            }
        });
        const results = await Promise.all(msgFetch);
        const controllers = results.filter(res => res.status === "success" && res.data).map(res => res.data!!);
        return new RaidScheduleChannel(channel, controllers);
    }

    constructor(private channel: TextChannel,
                private events: RaidEventController[]) {}

    public async addRaidEvent(event: RaidEvent) {
        this.events.push(await RaidEventController.createInChannel(this.channel, event));
    }

    // TODO: implement
    public async removeRaidEvent(event: RaidEvent) {
        this.events.push(await RaidEventController.createInChannel(this.channel, event));
    }

}
