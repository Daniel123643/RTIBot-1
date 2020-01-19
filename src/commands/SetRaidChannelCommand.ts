import { CategoryChannel, Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { RtiBotGuild } from "../RtiBotGuild";

export class SetRaidChannelCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            args: [
                {
                    key: "categoryid",
                    prompt: "Give the id of the category to use.",
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

    public async run(message: CommandoMessage,
                     args: { categoryid: CategoryChannel }): Promise<Message | Message[]> {
        RtiBotGuild.get(message.guild).raidService.setChannelCategory(args.categoryid);
        message.react("✅");
        return message.delete(5000); // TODO: check permissions
    }
}
