import { Message, TextChannel } from "discord.js";
import { CommandMessage, CommandoClient } from "discord.js-commando";
import { RtiBotGuild } from "../RtiBotGuild";
import { OfficerCommand } from "./base/OfficerCommand";

export class RemoveEventCommand extends OfficerCommand {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["cr"],
            args: [
                {
                    key: "composition",
                    prompt: "Give the name of the comp to remove",
                    type: "string",
                },
            ],
            description: "Removes a composition (irreversible!).",
            group: "raids",
            guildOnly: true,
            memberName: "compremove",
            name: "compremove",
        });
    }

    public async run(message: CommandMessage,
                     args: { composition: string }): Promise<Message | Message[]> {
        const compositionService = RtiBotGuild.get(message.guild).raidCompositionService;
        if (!compositionService.getRaidComposition(args.composition)) {
            return this.onFail(message, "There is no composition with that name.");
        }
        compositionService.removeRaidComposition(args.composition);
        message.react("✅");
        return Promise.resolve([]);
    }

    public onFail(message: CommandMessage, response: string) {
        message.react("❌");
        return message.reply(response);
    }
}
