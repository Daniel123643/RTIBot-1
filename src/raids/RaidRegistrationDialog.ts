import { GroupDMChannel, DMChannel, TextChannel, User } from "discord.js";
import { IRaidEvent } from "./data/RaidEvent";
import { UserDialog } from "../base/prompt/UserDialog";
import { MenuPrompt } from "../base/prompt/PromptHelpers";
import { IRaidRole } from "./data/RaidRole";

export class RaidRegistrationDialog extends UserDialog<IRaidRole> {
    public constructor(user: User,
                       channel: TextChannel | GroupDMChannel | DMChannel,
                       private event: IRaidEvent) {
        super(user, channel, "registration");
    }

    protected async doExecute(): Promise<IRaidRole> {
        this.say("You are registering for the event \"" + this.event.name + "\"");

        const roleNames = this.event.roles.map(r => r.name);
        const roleIndex = await new MenuPrompt("What role do you want to register as?",
                                                this.user,
                                                this.channel,
                                                roleNames).run();

        this.say("You have been registered for the event!");
        const selectedRole = this.event.roles[roleIndex];
        return selectedRole;
    }
}
