import { DMChannel, GroupDMChannel, Message, RichEmbed, TextChannel } from "discord.js";

/**
 * An embed that's kept track of and can be repeatedly updated.
 * The actual message is lazily created, meaning it will only be created
 * when you first set its content (or call getMessage).
 */
export class PersistentView {
    /**
     * Create a new view in the given channel.
     * @param channel The channel to create the view in
     */
    public static createInChannel(channel: TextChannel | DMChannel | GroupDMChannel): PersistentView {
        return new PersistentView(channel);
    }

    /**
     * Create a new view from a given message, removing the need to create a new message.
     * @param message The message to attach the view to
     */
    public static createFromMessage(message: Message): PersistentView {
        const view = new PersistentView(message.channel);
        view.message = message;
        return view;
    }

    private message: Message | null;
    private messagePromise: Promise<Message> | null;

    /**
     * Create a new view in the given channel.
     * @param channel The channel to create the view in
     */
    private constructor(private readonly channel: TextChannel | DMChannel | GroupDMChannel) {
        this.message = null;
        this.messagePromise = null;
    }

    public async getMessage(): Promise<Message> {
        return this.getOrCreateMessage("Placeholder.");
    }

    /**
     * Set what's displayed in the view
     */
    public async setContent(content: RichEmbed) {
        content.setTimestamp(new Date());
        const message = await this.getOrCreateMessage(content);
        message.edit(content);
    }

    private async getOrCreateMessage(initialContent: any) {
        if (!this.message) {
            if (this.messagePromise) {
                return this.messagePromise;
            }
            this.messagePromise = this.channel.send(initialContent) as Promise<Message>;
            this.message = await this.messagePromise;
            this.messagePromise = null;
        }
        return this.message;
    }
}
