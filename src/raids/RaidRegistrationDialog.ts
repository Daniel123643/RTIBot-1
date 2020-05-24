import { GroupDMChannel, DMChannel, TextChannel, User } from "discord.js";
import { RaidEvent } from "./data/RaidEvent";
import { UserDialog } from "../base/prompt/UserDialog";
import { MenuPrompt } from "../base/prompt/PromptHelpers";
import { RaidRole } from "./data/RaidRole";

export interface IRaidRegistrationResult {
    role: RaidRole;
    status: "participating" | "reserve";
 }

export class RaidRegistrationDialog extends UserDialog<IRaidRegistrationResult> {
    public constructor(user: User,
                       channel: TextChannel | GroupDMChannel | DMChannel,
                       private readonly event: RaidEvent) {
        super(user, channel, "registration");
    }

    protected async doExecute(): Promise<IRaidRegistrationResult> {
        await this.say("You are registering for the raid \"" + this.event.name + "\"");

        // first one option per role for main roster positions, then one per role for reserve
        let roleStrings = this.event.roles.map(r => `${r.name} (${r.numActiveParticipants}/${r.numRequiredParticipants})`);
        roleStrings = roleStrings.concat(this.event.roles.map(r => r.name + " (reserve)"));

        let roleIndex: number;
        // loop until the user selects a non-full role
        while (true) {
            roleIndex = await new MenuPrompt("What role do you want to register as?",
                                                    this.user,
                                                    this.channel,
                                                    roleStrings).run();
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

        await this.say("You have been registered for the raid!");
        return {
            role,
            status,
        };
    }
}
