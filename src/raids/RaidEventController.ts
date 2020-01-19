import { DMChannel, Message, MessageEmbed, TextChannel, User } from "discord.js";
import moment = require("moment");
import { PersistentView } from "../base/PersistentView";
import { MenuPrompt } from "../base/prompt/PromptHelpers";
import { ReactionButtonSet } from "../base/ReactionButtonSet";
import { Logger } from "../Logger";
import { RaidEvent, RaidParticipant } from "./RaidEvent";

/**
 * Displays and controls a raid event
 */
export class RaidEventController {
    public static loadFromMessage(message: Message, data: RaidEvent) {
        return new RaidEventController(new PersistentView(message), data);
    }

    public static async createInChannel(channel: TextChannel | DMChannel,
                                        data: RaidEvent): Promise<RaidEventController> {
        return new RaidEventController(await PersistentView.createInChannel(channel, "Placeholder."), data);
    }

    private static readonly EMOJI_REGISTER = "✅";
    private static readonly EMOJI_EDIT = "⚙️";
    private static readonly EMOJI_CANCEL = "❌";

    public get message() {
        return this.view.message;
    }

    private buttons: ReactionButtonSet;

    constructor(private view: PersistentView, private data: RaidEvent) {
        this.updateView();
        this.buttons = new ReactionButtonSet(view.message, [RaidEventController.EMOJI_REGISTER,
                                                            RaidEventController.EMOJI_EDIT,
                                                            RaidEventController.EMOJI_CANCEL]);
        this.buttons.buttonPressed.attach(([user, emoji]) => {
            Logger.Log(Logger.Severity.Debug, "Button " + emoji + " pressed.");
            switch (emoji) {
                case RaidEventController.EMOJI_REGISTER:
                    this.registerParticipant(user, view.message.channel);
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

    private generateContent(): MessageEmbed {
        const startString = this.data.startDate.format("ddd D MMM HH:mm");
        const endString = this.data.endDate.format("HH:mm");
        const content = new MessageEmbed()
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

    private async registerParticipant(user: User, errorChannel: TextChannel | DMChannel) {
        try {
            const dmc = await user.createDM();
            dmc.send("You are registering for the event \"" + this.data.name + "\"");

            const roleNames = this.data.roles.map(r => r.name);
            const roleIndex = await new MenuPrompt("What role do you want to register as?",
                                                    user,
                                                    dmc,
                                                    roleNames).run();

            this.data.roles[roleIndex].participants.push(new RaidParticipant(
                user,
                moment(),
                "participating",
            ));
            this.updateView();
            dmc.send("You have been registered for the event!");
        } catch {
            errorChannel.send(`${user}, Unable to send you a DM for registering to the raid. You probably have DMs disabled.`);
        }
    }
}
