import { Message, TextChannel } from "discord.js";
import { CommandMessage, CommandoClient } from "discord.js-commando";
import { RtiBotGuild } from "../RtiBotGuild";
import { AdminCommand } from "./base/AdminCommand";

export class RaidScheduleCommand extends AdminCommand {
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

    public run(message: CommandMessage): Promise<Message | Message[]> {
        RtiBotGuild.get(message.guild).raidEventService.addScheduleIn(message.channel as TextChannel);
        return this.onSuccess(message);
    }
}
