import { RichEmbed } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { RaidEvent } from "./RaidEvent";

/**
 * Controls a persistent raid schedule view, displaying a compact view of a set of events
 */
export class RaidScheduleController {
    public constructor(private view: PersistentView) {}

    /**
     * Sets  the content to display
     * @param events A sorted list of raid events to display
     */
    public updateView(events: RaidEvent[]) {
        this.view.setContent(this.generateContent(events));
    }

    private generateContent(events: RaidEvent[]) {
        const eventsString =  events.length === 0 ? "None." : events.map(event => {
                const startString = event.startDate.format("ddd D MMM HH:mm");
                const endString = event.endDate.format("HH:mm");
                return `**${event.name}** @ ${startString}-${endString} **(${event.totalParticipants}/${event.reqParticipants})**`;
            });
        return new RichEmbed()
            .setTitle("RTI Raid Schedule")
            .setDescription("Some usage information...")
            .setThumbnail("https://s3.amazonaws.com/files.enjin.com/1178746/modules/header/uploads/714415555a178b619fef91.02845354.jpeg")
            .setFooter("Some More Information.")
            .addField("Upcoming events:", eventsString);
    }
}
