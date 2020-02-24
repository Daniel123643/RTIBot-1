import { PersistentView } from "./PersistentView";
import { RichEmbed } from "discord.js";

/**
 * Displays a list of log entries in a pretty embed
 */
export class LogView {
    constructor(private title: string, private view: PersistentView) {}

    public get message() {
        return this.view.message;
    }

    public render(logEntries: string[]): void {
        const embed = new RichEmbed();
        embed.setTitle(this.title);
        embed.setDescription(logEntries.length > 0 ? logEntries : "Empty...");
        this.view.setContent(embed);
    }
}
