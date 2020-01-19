import { Message, TextChannel } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { RtiBotGuild } from "../RtiBotGuild";

export class RaidScheduleCommand extends Command {
    // TODO: permissions
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["rs"],
            description: "Prints a compact schedule of all raids, that is continously updated.",
            group: "setup",
            guildOnly: true,
            memberName: "raidschedule",
            name: "raidschedule",
        });
    }

    public run(message: CommandoMessage): Promise<Message | Message[]> {
        RtiBotGuild.get(message.guild).raidService.addScheduleIn(message.channel as TextChannel);
        message.react("✅");
        return Promise.resolve(message.delete(5000));
    }
}
