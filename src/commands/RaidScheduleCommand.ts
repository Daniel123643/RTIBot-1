import { Message, RichEmbed, TextChannel } from "discord.js";
import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import { RtiBotGuild } from "../RtiBotGuild";
import { MenuPrompt } from "../base/prompt/PromptHelpers";
import { Logger } from "../Logger";

export class RaidScheduleCommand extends Command {
    // TODO: permissions
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["rs"],
            description: "Prints a compact schedule of  all raids, that is continously updated.",
            group: "raids",
            guildOnly: true,
            memberName: "raidschedule",
            name: "raidschedule",
        });
    }

    public run(message: CommandMessage): Promise<Message | Message[]> {
        RtiBotGuild.get(message.guild).raidService.addScheduleIn(message.channel as TextChannel);
        message.react("✅");
        return Promise.resolve(message.delete(5000));
    }
}
