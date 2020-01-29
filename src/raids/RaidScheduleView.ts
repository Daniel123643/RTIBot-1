import { RichEmbed } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { IRaidEvent, RaidEvent } from "./data/RaidEvent";
import { unix } from "moment";
import { RaidEventChannel } from "./RaidEventChannel";

/**
 * Displays a persistent raid schedule view, with a compact view of a set of events
 */
export class RaidScheduleView {
    public constructor(private view: PersistentView) {}

    /**
     * Sets the content to display
     * @param channels A sorted list of raid channels to display
     */
    public update(channels: RaidEventChannel[]) {
        // TODO: link the channels
        const eventsString =  channels.length === 0 ? "None." : channels.map(channel => {
                const event = channel.event;
                const startString = unix(event.startDate).format("ddd D MMM HH:mm");
                const endString = unix(event.endDate).format("HH:mm");
                return `**${event.name}** @ ${startString}-${endString} **(${RaidEvent.totalParticipants(event)}/${RaidEvent.reqParticipants(event)})**`;
            });
        const content = new RichEmbed()
                        .setTitle("RTI Raid Schedule")
                        .setDescription("Some usage information...")
                        .setThumbnail("https://s3.amazonaws.com/files.enjin.com/1178746/modules/header/uploads/714415555a178b619fef91.02845354.jpeg")
                        .setFooter("Some More Information.")
                        .addField("Upcoming events:", eventsString);
        this.view.setContent(content);
    }
}
