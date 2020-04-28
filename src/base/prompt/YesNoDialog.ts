import { UserDialog } from "./UserDialog";
import { YesNoPrompt } from "./PromptHelpers";
import { User, TextChannel, GroupDMChannel, DMChannel } from "discord.js";

/**
 * A dialog that does nothing else but show a YesNoPrompt
 */
export class YesNoDialog extends UserDialog<boolean> {
    public constructor(private readonly textPrompt: string,
                       user: User,
                       channel: TextChannel | GroupDMChannel | DMChannel,
                       groupId?: string) {
        super(user, channel, groupId);
    }

    protected doExecute(): Promise<boolean> {
        return new YesNoPrompt(this.textPrompt, this.user, this.channel).run();
    }
}
