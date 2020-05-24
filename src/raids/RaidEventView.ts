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
    private static readonly ELLIPSIS = "…";

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
            .setThumbnail("https://cdn.discordapp.com/icons/156175293055369216/159ecf8097a61828bb42f4ed6c836223.webp");

        this.data.roles.forEach(role => {
            const title = `**${role.name}** (${role.numActiveParticipants}/${role.numRequiredParticipants})`;

            const participating = role.getParticipantsByStatus("participating");
            const removed = role.getParticipantsByStatus("removed");
            const merged = participating.concat(removed);
            const names = merged.map(participant => participant.render());
            const nameStr = names.length > 0 ? names.join("\n") : RaidEventView.ELLIPSIS;
            content.addField(title, nameStr, false);
        });
        let reserves: string[] = [];
        this.data.roles.forEach(role => {
            const roleReserves = role.getParticipantsByStatus("reserve");
            reserves = reserves.concat(roleReserves.map(participant => `${participant.render()} (${role.name})`));
        });
        content.addField("Reserves", reserves.length > 0 ? reserves : RaidEventView.ELLIPSIS);
        // NOTE: the field name contains a zero-width space to get around restrictions on empty names
        content.addField("​", "See <#701553485023543336> for help with registering to raids.");
        this.view.setContent(content);
    }

    private async registerParticipant(user: User): Promise<void> {
        try {
            const dmc = await user.createDM();
            const status = this.data.getParticipationStatusOf(user);
            if (status === "participating" || status === "reserve") {
                await Util.sendPrettyMessage(dmc, "You are already registered for this raid.");
                return;
            }
            const registration = await new RaidRegistrationDialog(user, dmc, this.data).run();
            if (registration) {
                this.data.register(user, registration.role, registration.status);
                this.eventChanged.trigger();
            }
        } catch (err) {
            if (err) {
                Logger.LogError(Logger.Severity.Debug, err);
                Util.sendPrettyMessage((await this.view.getMessage()).channel, `${user}, Unable to send you a DM for registering to the raid. You probably have DMs disabled.`);
            }
            Logger.Log(Logger.Severity.Debug, "A registration command was canceled.");
        }
    }

    private async deregisterParticipant(user: User): Promise<void> {
        try {
            const status = this.data.getParticipationStatusOf(user);
            const dmc = await user.createDM();
            if (!status || status === "removed") {
                await Util.sendPrettyMessage(dmc, "You are not registered for this raid.");
                return;
            }
            const cont = await new YesNoDialog(`Are you sure you want to unregister from the raid "${this.data.name}"?`, user, dmc).run();
            if (cont) {
                this.data.unregister(user);
                this.eventChanged.trigger();
                await Util.sendPrettyMessage(dmc, "You have been unregistered from the raid.");
            }
        } catch (err) {
            if (err) {
                Logger.LogError(Logger.Severity.Debug, err);
                Util.sendPrettyMessage((await this.view.getMessage()).channel, `${user}, Unable to send you a DM for unregistering from the raid. You probably have DMs disabled.`);
            }
            Logger.Log(Logger.Severity.Debug, "An unregistration command was canceled.");
        }
    }
}
