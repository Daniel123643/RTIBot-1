import { Message, RichEmbed, TextChannel } from "discord.js";
import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import { GuildRaidService } from "../GuildRaidService";

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
        GuildRaidService.getInstance(message.guild).addScheduleIn(message.channel as TextChannel);
        message.react("✅");
        return Promise.resolve(message.delete(5000));
    }
}
