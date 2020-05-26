import { GroupDMChannel, DMChannel, TextChannel, User } from "discord.js";
import { RaidEvent } from "./data/RaidEvent";
import { UserDialog } from "../base/prompt/UserDialog";
import { MenuPrompt } from "../base/prompt/PromptHelpers";
import { Logger } from "../Logger";
import { UnicodeEmoji } from "../base/UnicodeEmoji";

 /**
  * Lets a user select a role from an event, and registers them to it.
  * If the user is already registered, lets them edit the registration.
  * The dialog returns true if a registration was added or changed.
  */
export class RaidRegistrationDialog extends UserDialog<boolean> {
    public constructor(user: User,
                       channel: TextChannel | GroupDMChannel | DMChannel,
                       private readonly event: RaidEvent) {
        super(user, channel, "registration");
    }

    protected async doExecute(): Promise<boolean> {
        const prevStatus = this.event.getParticipationStatusOf(this.user);
        Logger.Log(Logger.Severity.Debug, prevStatus || "undef");
        const isRegistered = prevStatus === "participating" || prevStatus === "reserve";
        Logger.Log(Logger.Severity.Debug, isRegistered ? "true" : "false");
        const prevRole = this.event.getRoleOf(this.user);
        Logger.Log(Logger.Severity.Debug, prevRole?.name || "undf");
        await this.say((isRegistered ? "You are **changing** your registration for " : "You are registering for the raid ") + `**${this.event.name}**`);

        // first one option per role for main roster positions, then one per role for reserve
        const roleStrings = this.event.roles.map(r => {
            let str = `${r.name} (${r.numActiveParticipants}/${r.numRequiredParticipants})`;
            if (r === prevRole && prevStatus === "participating") { str += " <CURRENT ROLE>"; }
            return str;
        });
        const reserveRoleStrings = this.event.roles.map(r => {
            let str = r.name + " (reserve)";
            if (r === prevRole && prevStatus === "reserve") { str += "<CURRENT ROLE>"; }
            return str;
        });

        let roleIndex: number;
        // loop until the user selects a non-full role
        while (true) {
            roleIndex = await new MenuPrompt("What role do you want to " + (isRegistered ? "change to?" : "register as?"),
                                                    this.user,
                                                    this.channel,
                                                    roleStrings.concat(reserveRoleStrings)).run();
            const selectedStatus = roleIndex >= this.event.roles.length ? "reserve" : "participating";
            const selectedRole = this.event.roles[roleIndex % this.event.roles.length];
            if (selectedStatus === "participating" && selectedRole.numActiveParticipants >= selectedRole.numRequiredParticipants) {
                this.say("That role is already full. Either register as a reserve, or try another role.");
            } else {
                break;
            }
        }
        const status = roleIndex >= this.event.roles.length ? "reserve" : "participating";
        const role = this.event.roles[roleIndex % this.event.roles.length];

        this.event.register(this.user, role, status);

        await this.say(UnicodeEmoji.Checkmark + (isRegistered ? " Your registration has been changed!" : " You have been registered for the raid!"));
        return true;
    }
}
