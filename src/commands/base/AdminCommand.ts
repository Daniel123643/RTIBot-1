import { CommandMessage, CommandoClient, CommandInfo } from "discord.js-commando";
import { RtiBotGuild } from "../../RtiBotGuild";
import { BaseCommand } from "./BaseCommand";

/**
 * A guild-only admin command requiring admin privileges
 */
export abstract class AdminCommand extends BaseCommand {
    constructor(client: CommandoClient, info: CommandInfo) {
        info.guildOnly = true;
        super(client, info);
    }

    public hasPermission(message: CommandMessage) {
        return RtiBotGuild.get(message.guild).hasAdminPrivileges(message.member);
    }
}
