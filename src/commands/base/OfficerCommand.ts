import { CommandMessage, Command, CommandoClient, CommandInfo } from "discord.js-commando";
import { RtiBotGuild } from "../../RtiBotGuild";
import { BaseCommand } from "./BaseCommand";

/**
 * A guild-only command requiring officer privileges
 */
export abstract class OfficerCommand extends BaseCommand {
    constructor(client: CommandoClient, info: CommandInfo) {
        info.guildOnly = true;
        super(client, info);
    }

    public hasPermission(message: CommandMessage) {
        return RtiBotGuild.get(message.guild).hasOfficerPrivileges(message.member);
    }
}
