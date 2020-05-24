import { GroupDMChannel, DMChannel, TextChannel, User } from "discord.js";
import { RaidEvent } from "./data/RaidEvent";
import { UserDialog } from "../base/prompt/UserDialog";
import { MenuPrompt } from "../base/prompt/PromptHelpers";
import { RaidRole } from "./data/RaidRole";

export class RaidRegistrationDialog extends UserDialog<RaidRole> {
    public constructor(user: User,
                       channel: TextChannel | GroupDMChannel | DMChannel,
                       private readonly event: RaidEvent) {
        super(user, channel, "registration");
    }

    protected async doExecute(): Promise<RaidRole> {
        await this.say("You are registering for the raid \"" + this.event.name + "\"");

        const roleStrings = this.event.roles.map(r => `${r.name} (${r.numActiveParticipants}/${r.numRequiredParticipants})`);
        const roleIndex = await new MenuPrompt("What role do you want to register as?",
                                                this.user,
                                                this.channel,
                                                roleStrings).run();

        await this.say("You have been registered for the raid!");
        const selectedRole = this.event.roles[roleIndex];
        return selectedRole;
    }
}
