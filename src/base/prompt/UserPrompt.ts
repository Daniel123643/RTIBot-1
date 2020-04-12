import { DMChannel, GroupDMChannel, Message, TextChannel, User } from "discord.js";
import { Logger } from "../../Logger";

/**
 * Interactively prompts the user for some data as part of a dialog
 */
export abstract class UserPrompt<T> {
    private static readonly CANCEL_STRING = "Respond with cancel to `cancel` the command. The command will automatically be cancelled in 30 seconds.";

    /**
     * Create a new prompt.
     * @param textPrompt A prompt to show to the user (a mention will be added at the start)
     * @param user The user to listen to
     * @param channel The channel to prompt and listen in
     */
    public constructor(private textPrompt: string,
                       private user: User,
                       private channel: TextChannel | DMChannel | GroupDMChannel) {}

    /**
     * Run the prompt, interacting with the user until the prompt either gives a valid result, or is canceled.
     */
    public async run(): Promise<T> {
        const collector = this.channel.createMessageCollector((m: Message) => m.author === this.user, { time: 30000 });

        while (true) {
            this.say(this.textPrompt + "\n" + UserPrompt.CANCEL_STRING);
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
        this.say("The command was canceled.");
        collector.stop();
        return Promise.reject();
    }

    private say(msg: any): void {
        this.channel.send((`${this.user}, ${msg}`));
    }

    protected abstract validate(message: Message): { valid: boolean, msg: string | undefined };

    protected abstract parse(message: Message): T;

}
