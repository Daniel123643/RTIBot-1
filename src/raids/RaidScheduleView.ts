import { RichEmbed } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { IRaidEvent, RaidEvent } from "./data/RaidEvent";
import { unix } from "moment";

/**
 * Displays a persistent raid schedule view, with a compact view of a set of events
 */
export class RaidScheduleView {
    public constructor(private view: PersistentView) {}

    /**
     * Sets the content to display
     * @param events A sorted list of raid events to display
     */
    public update(events: IRaidEvent[]) {
        this.view.setContent(this.generateContent(events));
    }

    private generateContent(events: IRaidEvent[]) {
        const eventsString =  events.length === 0 ? "None." : events.map(event => {
                const startString = unix(event.startDate).format("ddd D MMM HH:mm");
                const endString = unix(event.endDate).format("HH:mm");
                return `**${event.name}** @ ${startString}-${endString} **(${RaidEvent.totalParticipants(event)}/${RaidEvent.reqParticipants(event)})**`;
            });
        return new RichEmbed()
            .setTitle("RTI Raid Schedule")
            .setDescription("Some usage information...")
            .setThumbnail("https://s3.amazonaws.com/files.enjin.com/1178746/modules/header/uploads/714415555a178b619fef91.02845354.jpeg")
            .setFooter("Some More Information.")
            .addField("Upcoming events:", eventsString);
    }
}
