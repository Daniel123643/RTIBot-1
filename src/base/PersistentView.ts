import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { CommandoClient } from "discord.js-commando";
import { Logger } from "../Logger";

/**
 * An embed that's kept track of and can be repeatedly updated
 */
export class PersistentView {
    /**
     * Create a new message in a channel and attach a new view to it
     * @param channel The channel to create the view in
     * @param initialContent The content to place in the view
     */
    public static async createInChannel(channel: TextChannel | DMChannel | GroupDMChannel,
                                        initialContent: any): Promise<PersistentView> {
        const msg = await channel.send(initialContent);
        return new PersistentView(msg as Message);
    }

    /**
     * Create a new view attached to a message
     * @param message The message to attach to
     */
    constructor(public message: Message) {}

    /**
     * Set what's displayed in the view
     */
    public setContent(content: any) {
        if (this.message.editable) {
            this.message.edit(content);
        } else {
            Logger.Log(Logger.Severity.Error, "Trying to edit uneditable message: " + this.message.cleanContent);
        }
    }
}
