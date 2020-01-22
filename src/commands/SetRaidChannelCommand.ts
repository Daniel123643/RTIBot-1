import { CategoryChannel, Message, Permissions } from "discord.js";
import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import { RtiBotGuild } from "../RtiBotGuild";

export class SetRaidChannelCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            args: [
                {
                    key: "category",
                    prompt: "Give the category to use.",
                    type: "category-channel",
                },
            ],
            description: "Sets the channel category to use for raid channels.",
            group: "setup",
            guildOnly: true,
            memberName: "raidsetcategory",
            name: "raidsetcategory",
            ownerOnly: true,
        });
    }

    public async run(message: CommandMessage,
                     args: { category: CategoryChannel }): Promise<Message | Message[]> {
        if (args.category.guild !== message.guild) {
            return this.onFail(message, "That category is not in this server.");
        }

        const permissions = args.category.permissionsFor(this.client.user!);
        if (permissions &&
            permissions.has([Permissions.FLAGS.MANAGE_CHANNELS!, Permissions.FLAGS.MANAGE_MESSAGES!], true)) {
            RtiBotGuild.get(message.guild).raidService.setChannelCategory(args.category);
            if (args.category.guild !== message.guild) { return message.delete(); } // TODO:
            message.react("✅");
            return message.delete(5000); // TODO: check permissions
        } else {
            return this.onFail(message, "Command failed, I need the following permissions in that category:\nManage Channels\nManage Messages");
        }
    }

    public onFail(message: CommandMessage, response: string) {
        message.react("❌");
        return message.reply(response);
    }
}
