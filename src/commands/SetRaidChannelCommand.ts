import { CategoryChannel, Message, Permissions } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
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
            userPermissions: ["ADMINISTRATOR"],
        });
    }

    public async run(message: CommandoMessage,
                     args: { category: CategoryChannel }): Promise<Message | Message[]> {
        const permissions = args.category.permissionsFor(this.client.user!);
        if (permissions &&
            permissions.has(Permissions.FLAGS.MANAGE_CHANNELS, true) &&
            permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            RtiBotGuild.get(message.guild).raidService.setChannelCategory(args.category);
            message.react("✅");
            return message.delete(5000); // TODO: check permissions
        } else {
            message.react("❌");
            return message.reply("Command failed, I need the following permissions in that category:\nManage Channels\nManage Messages");
        }
    }
}
