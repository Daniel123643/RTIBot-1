import { DMChannel, GroupDMChannel, Message, MessageReaction, RichEmbed, TextChannel, User } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { ReactionButtonSet } from "../base/ReactionButtonSet";
import { Logger } from "../Logger";
import { RaidEvent } from "./RaidEvent";

/**
 * Displays and controls a raid event
 */
export class RaidEventController {
    public static loadFromMessage(message: Message, data: RaidEvent) {
        return new RaidEventController(new PersistentView(message), data);
    }

    public static async createInChannel(channel: TextChannel | DMChannel | GroupDMChannel,
                                        data: RaidEvent): Promise<RaidEventController> {
        return new RaidEventController(await PersistentView.createInChannel(channel, "Placeholder."), data);
    }

    private static readonly EMOJI_REGISTER = "✅";
    private static readonly EMOJI_EDIT = "⚙️";
    private static readonly EMOJI_CANCEL = "❌";

    private buttons: ReactionButtonSet;

    constructor(private view: PersistentView, private data: RaidEvent) {
        this.updateView();
        this.buttons = new ReactionButtonSet(view.message, [RaidEventController.EMOJI_REGISTER,
                                                            RaidEventController.EMOJI_EDIT,
                                                            RaidEventController.EMOJI_CANCEL]);
        this.buttons.buttonPressed.attach(emoji => {
            Logger.Log(Logger.Severity.Debug, "Button " + emoji + " pressed.");
            switch (emoji) {
                case RaidEventController.EMOJI_REGISTER:
                    break;
                case RaidEventController.EMOJI_EDIT:
                    break;
                case RaidEventController.EMOJI_CANCEL:
                    break;
            }
        });
    }

    private updateView() {
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
            const names = role.participants.length > 0 ? role.participants.join("\n") : "...";
            const title = `${role.emojiName} **${role.name}** (${role.participants.length}/${role.reqQuantity})`;
            content.addField(title, names, true);
        });
        return content;
    }
}
