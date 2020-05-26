import { DMChannel, GroupDMChannel, Message, TextChannel, User, RichEmbed } from "discord.js";
import { Logger } from "../../Logger";
import { Util } from "../../Util";
import { UnicodeEmoji } from "../UnicodeEmoji";

/**
 * Interactively prompts the user for some data as part of a dialog
 */
export abstract class UserPrompt<T> {
    private static readonly CANCEL_STRING = "Respond with cancel to `cancel` the command. The command will automatically be cancelled in 30 seconds.";

    /**
     * Create a new prompt.
     * @param title The title
     * @param content The main content
     * @param channel The channel to prompt and listen in
     */
    public constructor(private readonly title: string | undefined,
                       private readonly content: string | undefined,
                       private readonly user: User,
                       private readonly channel: TextChannel | DMChannel | GroupDMChannel) {}

    /**
     * Run the prompt, interacting with the user until the prompt either gives a valid result, or is canceled.
     */
    public async run(): Promise<T> {
        const collector = this.channel.createMessageCollector((m: Message) => m.author === this.user, { time: 30000 });

        while (true) {
            this.say(this.title, this.content);
            try {
                const msg = await collector.next;
                Logger.Log(Logger.Severity.Debug, `Prompt response by ${this.user.username}: ${msg.content}`);

                if (msg.content.trim().toLowerCase() === "cancel") {
                    break;
                }
                const validation = this.validate(msg);
                if (validation.valid) {
                    collector.stop();
                    return Promise.resolve(this.parse(msg));
                } else {
                    if (validation.msg) { this.say(validation.msg); }
                }
            } catch (e) {
                break; // probably timed out
            }
        }

        Logger.Log(Logger.Severity.Debug, "Prompt canceled");
        Util.sendPrettyMessage(this.channel, UnicodeEmoji.Fail + " The command was canceled.");
        collector.stop();
        return Promise.reject();
    }

    protected abstract validate(message: Message): { valid: boolean, msg: string | undefined };

    protected abstract parse(message: Message): T;

    private say(title?: string, content?: string): void {
        const embed = new RichEmbed();
        if (title) { embed.setTitle(title); }
        if (content) { embed.setDescription(content); }
        embed.setFooter(UserPrompt.CANCEL_STRING);
        this.channel.send(embed);
    }

}
