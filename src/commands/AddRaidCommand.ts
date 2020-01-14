import { Message, RichEmbed, TextChannel } from "discord.js";
import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import { PersistentView } from "../base/PersistentView";
import { RaidEntryController } from "../RaidEntryController";
import { RaidEntry } from "../RaidEntry";

export class AddRaidCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["ra"],
            description: "Adds a new raid to the schedule",
            group: "raids",
            guildOnly: true,
            memberName: "raidadd",
            name: "raidadd",
        });
    }

    public run(message: CommandMessage,
               args: string | object | string[],
               fromPattern: boolean): Promise<Message | Message[]> {
        RaidEntryController.createInChannel(message.channel);
        message.react("✅");
        message.delete(5000); // TODO: check permissions
        return Promise.reject();
    }
}
