import { GroupDMChannel, DMChannel, TextChannel, User } from "discord.js";
import { RaidEvent } from "./data/RaidEvent";
import { UserDialog } from "../base/prompt/UserDialog";
import { MenuPrompt } from "../base/prompt/PromptHelpers";
import { RaidRole } from "./data/RaidRole";

export class RaidRegistrationDialog extends UserDialog<RaidRole> {
    public constructor(user: User,
                       channel: TextChannel | GroupDMChannel | DMChannel,
                       private event: RaidEvent) {
        super(user, channel, "registration");
    }

    protected async doExecute(): Promise<RaidRole> {
        await this.say("You are registering for the event \"" + this.event.name + "\"");

        const roleNames = this.event.roles.map(r => r.name);
        const roleIndex = await new MenuPrompt("What role do you want to register as?",
                                                this.user,
                                                this.channel,
                                                roleNames).run();

        await this.say("You have been registered for the event!");
        const selectedRole = this.event.roles[roleIndex];
        return selectedRole;
    }
}
