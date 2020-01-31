import { DMChannel, GroupDMChannel, Message, RichEmbed, TextChannel, User } from "discord.js";
import moment = require("moment");
import { PersistentView } from "../base/PersistentView";
import { ReactionButtonSet } from "../base/ReactionButtonSet";
import { Logger } from "../Logger";
import { IRaidEvent, RaidEvent } from "./data/RaidEvent";
import { RaidRegistrationDialog } from "./RaidRegistrationDialog";
import { Event } from "../base/Event";
import { Util } from "../Util";
import { RaidParticipant } from "./data/RaidParticipant";
import { RaidRole } from "./data/RaidRole";

/**
 * Displays a raid event as an embed message, and allows registering to the event via rection buttons on the message.
 */
export class RaidEventView {
    private static readonly EMOJI_REGISTER = "✅";
    private static readonly EMOJI_EDIT = "⚙️";
    private static readonly EMOJI_CANCEL = "❌";

    public get data(): IRaidEvent {
        return this._data;
    }
    public get message() {
        return this.view.message;
    }

    public eventChanged: Event<void> = new Event();
    private buttons: ReactionButtonSet;

    constructor(private view: PersistentView, private _data: IRaidEvent) {
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
        const startString = moment.unix(this.data.startDate).format("ddd D MMM HH:mm");
        const endString = moment.unix(this.data.endDate).format("HH:mm");
        const content = new RichEmbed()
            .setTitle(`${this.data.name} @ ${startString}-${endString}`)
            .setDescription(this.data.description + "\n**Leader:** " + Util.toMention(this.data.leaderId))
            .setThumbnail("https://wiki.guildwars2.com/images/thumb/7/7a/Deimos.jpg/240px-Deimos.jpg")
            .setFooter("To register, react with the role you want to play.");
        this.data.roles.forEach(role => {
            let names = role.participants.map(p => RaidParticipant.render(p)).join("\n");
            if (!names) { names = "..."; }
            const title = `**${role.name}** (${role.participants.length}/${role.reqQuantity})`;
            content.addField(title, names, false);
        });
        this.view.setContent(content);
    }

    private async registerParticipant(user: User): Promise<void> {
        try {
            if (RaidEvent.isParticipating(this.data, user)) {
                user.send("You are already registered for this event.");
                return;
            }
            const dmc = await user.createDM();
            try {
                const role = await new RaidRegistrationDialog(user, dmc, this.data).run();
                RaidRole.register(role, user);
                this.eventChanged.trigger();
                this.update();
            } catch (err) {
                Logger.Log(Logger.Severity.Debug, "A registration command was canceled.");
            }
        } catch {
            this.view.message.channel.send(`${user}, Unable to send you a DM for registering to the raid. You probably have DMs disabled.`);
        }
    }
}
