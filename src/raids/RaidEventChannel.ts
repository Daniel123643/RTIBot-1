import { DMChannel, GroupDMChannel, TextChannel, Snowflake, Client, Guild } from "discord.js";
import { RaidEvent } from "./data/RaidEvent";
import { RaidEventView } from "./RaidEventView";
import { Event } from "../base/Event";
import { PersistentView } from "../base/PersistentView";
import { LogView } from "../base/LogView";

/**
 * A text channel dedicated to and event.
 * Contains an embed at the top with event information.
 */
export class RaidEventChannel {
    public static async createInChannel(channel: TextChannel | DMChannel | GroupDMChannel, event: RaidEvent) {
        const view = new RaidEventView(await PersistentView.createInChannel(channel, "Placeholder."), event);
        const logView = new LogView("Event Log", await PersistentView.createInChannel(channel, "Placeholder."));
        view.message.pin();
        return new RaidEventChannel(channel, view, logView);
    }

    public static async fromObj(guild: Guild, obj: object): Promise<RaidEventChannel> {
        const event = RaidEvent.deserialize(obj["event"]);
        const channelId = obj["channel"] as Snowflake;
        const messageId = obj["message"] as Snowflake;
        const logMessageId = obj["logMessage"] as Snowflake;

        const channel = guild.channels.get(channelId) as TextChannel;
        if (!channel) { throw new Error("Channel not found for " + event.name); }
        const message = await channel.fetchMessage(messageId);
        if (!message) { throw new Error("Message not found for " + event.name); }
        const logMessage = await channel.fetchMessage(logMessageId);
        const view = new RaidEventView(new PersistentView(message), event);
        const logView = new LogView("Event Log", new PersistentView(logMessage));
        return new RaidEventChannel(channel, view, logView);
    }

    private constructor(private _channel: TextChannel | DMChannel | GroupDMChannel,
                        private eventView: RaidEventView,
                        private logView: LogView) {
        logView.render(eventView.data.logEntries);
        eventView.eventChanged.attach(() => {
            logView.render(eventView.data.logEntries);
        });
        // TODO: set permissions?
    }

    public get channel(): TextChannel | DMChannel | GroupDMChannel {
        return this._channel;
    }

    public get event(): RaidEvent {
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
            logMessage: this.logView.message.id,
            message: this.eventView.message.id,
        };
    }
}
