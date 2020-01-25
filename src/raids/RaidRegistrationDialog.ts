import { GroupDMChannel, DMChannel, TextChannel, User } from "discord.js";
import { RaidParticipant, RaidEvent, RaidRole } from "./RaidEvent";
import { UserDialog } from "../base/prompt/UserDialog";
import { MenuPrompt } from "../base/prompt/PromptHelpers";
import moment = require("moment");

export class RaidRegistrationDialog extends UserDialog<RaidRole> {
    public constructor(user: User,
                       channel: TextChannel | GroupDMChannel | DMChannel,
                       private event: RaidEvent) {
        super(user, channel, "registration");
    }

    protected async doExecute(): Promise<RaidRole> {
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