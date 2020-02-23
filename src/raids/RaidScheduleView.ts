import { RichEmbed, Message, Guild, TextChannel } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { RaidEvent } from "./data/RaidEvent";
import { unix } from "moment";
import { RaidEventChannel } from "./RaidEventChannel";

/**
 * Displays a persistent raid schedule view, with a compact view of a set of events
 */
export class RaidScheduleView {
    /**
     * Reinstantiates a schedule from an object previously obtained from toObj
     */
    public static async fromObj(guild: Guild, obj: object): Promise<RaidScheduleView> {
        const channel = guild.channels.get(obj["channel"]);
        if (!channel) { return Promise.reject(); }
        const message = await (channel as TextChannel).fetchMessage(obj["msg"]);
        return new RaidScheduleView(new PersistentView(message));
    }

    public constructor(private view: PersistentView) {}

    /**
     * Sets the content to display
     * @param channels A sorted list of raid channels to display
     */
    public update(channels: RaidEventChannel[]) {
        const eventsString =  channels.length === 0 ? "None." : channels.map(channel => {
                const event = channel.event;
                const startString = event.startTime.format("ddd D MMM HH:mm");
                const endString = event.endTime.format("HH:mm");
                return `**${event.name}** @ ${startString}-${endString} **(${event.numRequiredParticipants}/${event.numRequiredParticipants})** | ${channel.channel}`;
            });
        const content = new RichEmbed()
                        .setTitle("RTI Raid Schedule")
                        .setDescription("Some usage information...")
                        .setThumbnail("https://s3.amazonaws.com/files.enjin.com/1178746/modules/header/uploads/714415555a178b619fef91.02845354.jpeg")
                        .setFooter("Some More Information.")
                        .addField("Upcoming events:", eventsString);
        this.view.setContent(content);
    }

    /**
     * Converts this to a JSON-serial>izable object reinstantiable via fromObj
     */
    public toObj(): object {
        return { msg: this.view.message.id, channel: this.view.message.channel.id };
    }
}
