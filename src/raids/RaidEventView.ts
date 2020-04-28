import { RichEmbed, User } from "discord.js";
import { PersistentView } from "../base/PersistentView";
import { ReactionButtonSet } from "../base/ReactionButtonSet";
import { Logger } from "../Logger";
import { RaidEvent } from "./data/RaidEvent";
import { RaidRegistrationDialog } from "./RaidRegistrationDialog";
import { Event } from "../base/Event";
import { Util } from "../Util";
import { YesNoDialog } from "../base/prompt/YesNoDialog";
import { UnicodeEmoji } from "../base/UnicodeEmoji";

/**
 * Displays a raid event as an embed message, and allows registering to the event via rection buttons on the message.
 */
export class RaidEventView {
    private static readonly EMOJI_REGISTER = UnicodeEmoji.Checkmark;
    private static readonly EMOJI_CANCEL = UnicodeEmoji.Fail;

    public get data(): RaidEvent {
        return this._data;
    }
    public get message() {
        return this.view.getMessage();
    }

    /**
     * Triggered when the event held by this view is changed.
     * This event works two-way, i.e. another class can change this view's event,
     * and then trigger this event to update the view.
     */
    public eventChanged: Event<void> = new Event();
    private buttons: ReactionButtonSet;

    constructor(private readonly view: PersistentView, private readonly _data: RaidEvent) {
        this.update();
        view.getMessage().then(msg => {
            this.buttons = new ReactionButtonSet(msg, [RaidEventView.EMOJI_REGISTER,
                                                                RaidEventView.EMOJI_CANCEL]);
            this.buttons.buttonPressed.attach(([user, emoji]) => {
                Logger.Log(Logger.Severity.Debug, "Button " + emoji + " pressed.");
                switch (emoji) {
                    case RaidEventView.EMOJI_REGISTER:
                        this.registerParticipant(user);
                        break;
                    case RaidEventView.EMOJI_CANCEL:
                        this.deregisterParticipant(user);
                        break;
                }
            });
        });
        this.eventChanged.attach(this.update.bind(this));
    }

    private update() {
        const startString = this.data.startTime.format("ddd D MMM HH:mm");
        const endString = this.data.endTime.format("HH:mm");
        const content = new RichEmbed()
            .setTitle(`${this.data.name} @ ${startString}-${endString}`)
            .setDescription(this.data.description + "\n**Leader:** " + Util.toMention(this.data.leaderId))
            .setThumbnail("https://wiki.guildwars2.com/images/thumb/7/7a/Deimos.jpg/240px-Deimos.jpg")
            .setFooter("To register, press the checkmark.");

        this.data.roles.forEach(role => {
            const title = `**${role.name}** (${role.numActiveParticipants}/${role.numRequiredParticipants})`;

            const participants = role.participantsSorted;
            const names = participants.map(participant => participant.render());
            if (names.length > role.numRequiredParticipants) { names.splice(role.numRequiredParticipants, 0, "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯"); }
            const nameStr = names.length > 0 ? names.join("\n") : "…";
            content.addField(title, nameStr, false);
        });
        this.view.setContent(content);
    }

    private async registerParticipant(user: User): Promise<void> {
        try {
            if (this.data.getParticipationStatusOf(user) === "participating") {
                await user.send("You are already registered for this event.");
                return;
            }
            const dmc = await user.createDM();
            const role = await new RaidRegistrationDialog(user, dmc, this.data).run();
            if (role) {
                this.data.register(user, role);
                this.eventChanged.trigger();
            }
        } catch (err) {
            if (err) {
                (await this.view.getMessage()).channel.send(`${user}, Unable to send you a DM for registering to the raid. You probably have DMs disabled.`);
            }
            Logger.Log(Logger.Severity.Debug, "A registration command was canceled.");
        }
    }

    private async deregisterParticipant(user: User): Promise<void> {
        try {
            const status = this.data.getParticipationStatusOf(user);
            if (!status || status === "removed") {
                user.send("You are not registered for this event.");
                return;
            }
            const dmc = await user.createDM();
            const cont = await new YesNoDialog("Are you sure you want to deregister from the event \"" + this.data.name + "\"?", user, dmc).run();
            if (cont) {
                this.data.unregister(user);
                this.eventChanged.trigger();
                await dmc.send("You have been deregistered from the event.");
            }
        } catch (err) {
            if (err) {
                (await this.view.getMessage()).channel.send(`${user}, Unable to send you a DM for deregistering from the raid. You probably have DMs disabled.`);
            }
            Logger.Log(Logger.Severity.Debug, "A deregistration command was canceled.");
        }
    }
}
