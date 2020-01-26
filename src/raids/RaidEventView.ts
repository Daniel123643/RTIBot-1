import { DMChannel, GroupDMChannel, Message, RichEmbed, TextChannel, User } from "discord.js";
import moment = require("moment");
import { PersistentView } from "../base/PersistentView";
import { MenuPrompt } from "../base/prompt/PromptHelpers";
import { ReactionButtonSet } from "../base/ReactionButtonSet";
import { Logger } from "../Logger";
import { RaidEvent, RaidParticipant } from "./RaidEvent";
import { RaidRegistrationDialog } from "./RaidRegistrationDialog";
import { Event } from "../base/Event";

/**
 * Displays a raid event as an embed message, and allows registering to the event via rection buttons on the message.
 */
export class RaidEventView {
    public static loadFromMessage(message: Message, data: RaidEvent) {
        return new RaidEventView(new PersistentView(message), data);
    }

    public static async createInChannel(channel: TextChannel | DMChannel | GroupDMChannel,
                                        data: RaidEvent): Promise<RaidEventView> {
        return new RaidEventView(await PersistentView.createInChannel(channel, "Placeholder."), data);
    }

    private static readonly EMOJI_REGISTER = "✅";
    private static readonly EMOJI_EDIT = "⚙️";
    private static readonly EMOJI_CANCEL = "❌";

    /**
     * The message displaying the raid event
     */
    public get message() {
        return this.view.message;
    }

    public eventChanged: Event<RaidEvent> = new Event();

    private buttons: ReactionButtonSet;

    constructor(private view: PersistentView, private data: RaidEvent) {
        this.update();
        this.buttons = new ReactionButtonSet(view.message, [RaidEventView.EMOJI_REGISTER,
                                                            RaidEventView.EMOJI_EDIT,
                                                            RaidEventView.EMOJI_CANCEL]);
        this.buttons.buttonPressed.attach(([user, emoji]) => {
            Logger.Log(Logger.Severity.Debug, "Button " + emoji + " pressed.");
            switch (emoji) {
                case RaidEventView.EMOJI_REGISTER:
                    this.registerParticipant(user);
                    break;
                case RaidEventView.EMOJI_EDIT:
                    break;
                case RaidEventView.EMOJI_CANCEL:
                    break;
            }
        });
    }

    private update() {
        this.view.setContent(this.generateContent());
    }

    private generateContent(): RichEmbed {
        const startString = this.data.startDate.format("ddd D MMM HH:mm");
        const endString = this.data.endDate.format("HH:mm");
        const content = new RichEmbed()
            .setTitle(`${this.data.name} @ ${startString}-${endString}`)
            .setDescription(this.data.description + "\n**Leader:** " + this.data.leader)
            .setThumbnail("https://wiki.guildwars2.com/images/thumb/7/7a/Deimos.jpg/240px-Deimos.jpg")
            .setFooter("To register, react with the role you want to play.");
        this.data.roles.forEach(role => {
            let names = role.participants.map(p => p.render()).join("\n");
            if (!names) { names = "..."; }
            const title = `**${role.name}** (${role.participants.length}/${role.reqQuantity})`;
            content.addField(title, names, true);
        });
        return content;
    }

    private async registerParticipant(user: User): Promise<void> {
        try {
            if (this.data.isParticipating(user)) {
                user.send("You are already registered for this event.");
                return;
            }
            const dmc = await user.createDM();
            try {
                const role = await new RaidRegistrationDialog(user, dmc, this.data).run();
                role.register(user);
                this.eventChanged.trigger(this.data);
                this.update();
            } catch (_) {
                Logger.Log(Logger.Severity.Debug, "A registration command was canceled.");
            }
        } catch {
            this.view.message.channel.send(`${user}, Unable to send you a DM for registering to the raid. You probably have DMs disabled.`);
        }
    }
}
