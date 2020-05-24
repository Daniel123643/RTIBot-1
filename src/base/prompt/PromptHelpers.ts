import { DMChannel, GroupDMChannel, Message, TextChannel, User } from "discord.js";
import { UserPrompt } from "./UserPrompt";

// Some common prompts

/**
 * Prompts the user to select one of several menu options.
 * Returns the index of the option chosen
 */
export class MenuPrompt extends UserPrompt<number> {
    private readonly options: string[];
    /**
     *
     * @param textPrompt Prompt shown as the title
     * @param user User to listen to
     * @param channel Channel to listen in
     * @param options Options to choose from
     */
    public constructor(textPrompt: string,
                       user: User,
                       channel: TextChannel | DMChannel | GroupDMChannel,
                       options: string[]) {
        // Formats the options:
        //   `1.` like
        //   `2.` this
        const content = options.map((opt, i) => `  \`${i + 1}. ${opt}\``).join("\n") + "\n" +
                        "Please type in a number to select an option.";
        super(textPrompt, content, user, channel);
        this.options = options;
    }

    protected validate(message: Message): { valid: boolean; msg: string | undefined; } {
        const matches = message.content.trim().match(/^(?<i>\d+)\.*$/);
        if (!matches || !matches.groups)  {
            return { valid: false, msg: "That is not a valid number." };
        }
        const chosenIndex = Number(matches.groups.i);
        if (chosenIndex <= 0 || chosenIndex > this.options.length) {
            return { valid: false, msg: "That number is out of range." };
        }
        return { valid: true, msg: undefined };
    }

    protected parse(message: Message): number {
        const matches = message.content.trim().match(/^(?<i>\d+)\.*$/);
        return Number(matches!.groups!.i) - 1;
    }
}

export class YesNoPrompt extends UserPrompt<boolean> {
    public constructor(textPrompt: string,
                       user: User,
                       channel: TextChannel | DMChannel | GroupDMChannel) {
        const footer = "Please respond with either `yes` or `no`.";
        super(textPrompt, footer, user, channel);
    }

    protected validate(message: Message): { valid: boolean; msg: string | undefined; } {
        const content = message.content.toLowerCase();
        return {
            msg: "Please respond with either `yes` or `no`.",
            valid: content.match(/^\s*(yes|no|y|n)\s*$/) !== null,
        };
    }

    protected parse(message: Message): boolean {
        const content = message.content.toLowerCase();
        if (content.match(/^\s*(yes|y)\s*$/)) {
            return true;
        }
        if (content.match(/^\s*(no|n)\s*$/)) {
            return false;
        }
        return true;
    }

}
