import { DMChannel, GroupDMChannel, TextChannel, Snowflake, Client, Guild } from "discord.js";
import { IRaidEvent } from "./data/RaidEvent";
import { RaidEventView } from "./RaidEventView";
import { Event } from "../base/Event";

/**
 * A text channel dedicated to and event.
 * Contains an embed at the top with event information.
 */
export class RaidEventChannel {
    public static async createInChannel(channel: TextChannel | DMChannel | GroupDMChannel, event: IRaidEvent) {
        const controller = await RaidEventView.createInChannel(channel, event);
        controller.message.pin();
        return new RaidEventChannel(channel, controller);
    }

    public static async fromObj(guild: Guild, obj: object): Promise<RaidEventChannel> {
        const event = obj["event"] as IRaidEvent;
        const channelId = obj["channel"] as Snowflake;
        const messageId = obj["message"] as Snowflake;

        const channel = guild.channels.get(channelId) as TextChannel;
        if (!channel) { throw new Error("Channel not found for " + event.toString()); }
        const message = await channel.fetchMessage(messageId);
        if (!message) { throw new Error("Message not found for " + event.toString()); }
        const view = RaidEventView.loadFromMessage(message, event);
        return new RaidEventChannel(channel, view);
    }

    private constructor(private _channel: TextChannel | DMChannel | GroupDMChannel,
                        private eventView: RaidEventView) {
        // TODO: set permissions?
    }

    public get channel(): TextChannel | DMChannel | GroupDMChannel {
        return this._channel;
    }

    public get event(): IRaidEvent {
        return this.eventView.data;
    }

    public get eventChanged(): Event<void> {
        return this.eventView.eventChanged;
    }

    /**
     * Converts this raid channel into a serializable object
     */
    public toObj(): object {
        return {
            channel: this._channel.id,
            event: this.eventView.data,
            message: this.eventView.message.id,
        };
    }
}
