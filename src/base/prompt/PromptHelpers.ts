import { DMChannel, GroupDMChannel, Message, TextChannel, User } from "discord.js";
import { UserPrompt } from "./UserPrompt";

// Some common prompts

/**
 * Prompts the user to select one of several menu options.
 * Returns the index of the option chosen
 */
export class MenuPrompt extends UserPrompt<number> {
    private options: string[];
    public constructor(textPrompt: string,
                       user: User,
                       channel: TextChannel | DMChannel | GroupDMChannel,
                       options: string[]) {
        // Formats the options:
        //   `1.` like
        //   `2.` this
        const prompt = textPrompt
                       + "\n"
                       + options.map((opt, i) => `  \`${i + 1}.\` ${opt}`).join("\n")
                       + "\nPlease type in a number to select an option.";
        super(prompt, user, channel);
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
